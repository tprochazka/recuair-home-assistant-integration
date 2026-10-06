"""Shared data coordinator for Recuair entities."""
from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from .api import RecuairApi, RecuairApiError
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class RecuairCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinate one status-page poll for all Recuair entities."""

    def __init__(self, hass: HomeAssistant, api: RecuairApi, scan_interval: int) -> None:
        """Initialize the coordinator and shared device API."""
        self.api = api
        self.maintenance_lock = asyncio.Lock()
        self._firmware_update_started = None
        self._firmware_update_target = None
        self._firmware_update_error = None
        self._background_interval = timedelta(seconds=scan_interval)
        self._dashboard_clients: dict[str, float] = {}
        self._cancel_dashboard_expiry = None
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_method=self._async_update_data,
            update_interval=timedelta(seconds=scan_interval),
        )

    @callback
    def async_dashboard_activity(self, client_id: str, active: bool) -> bool:
        """Renew a short UI lease; multiple dashboards share one polling loop."""
        was_active = bool(self._dashboard_clients)
        if active:
            self._dashboard_clients[client_id] = self.hass.loop.time() + 35
        else:
            self._dashboard_clients.pop(client_id, None)
        self._expire_dashboard_clients()
        return active and not was_active

    @callback
    def _expire_dashboard_clients(self, _now=None) -> None:
        now = self.hass.loop.time()
        self._dashboard_clients = {
            client: expiry for client, expiry in self._dashboard_clients.items()
            if expiry > now
        }
        interval = timedelta(seconds=10) if self._dashboard_clients else self._background_interval
        if interval != self.update_interval:
            self.update_interval = interval
            self._schedule_refresh()
        if self._cancel_dashboard_expiry:
            self._cancel_dashboard_expiry()
            self._cancel_dashboard_expiry = None
        if self._dashboard_clients:
            self._cancel_dashboard_expiry = async_call_later(
                self.hass, max(0, min(self._dashboard_clients.values()) - now),
                self._expire_dashboard_clients,
            )

    async def async_shutdown(self) -> None:
        """Cancel UI leases as well as the coordinator's polling timer."""
        if self._cancel_dashboard_expiry:
            self._cancel_dashboard_expiry()
            self._cancel_dashboard_expiry = None
        self._dashboard_clients.clear()
        await super().async_shutdown()

    @property
    def firmware_update_in_progress(self) -> bool:
        return self._firmware_update_started is not None

    @property
    def firmware_update_error(self):
        return self._firmware_update_error

    def _update_metadata(self, data: dict) -> dict:
        return {**data, "firmware_update_in_progress": self.firmware_update_in_progress,
                "firmware_update_error": self._firmware_update_error}

    async def async_start_firmware_update(self) -> None:
        """Publish update state before the unit disappears from the network."""
        async with self.maintenance_lock:
            await self._async_start_firmware_update()

    async def _async_start_firmware_update(self) -> None:
        if self.firmware_update_in_progress:
            return
        target = (self.data or {}).get("firmware_available_version")
        installed = (self.data or {}).get("firmware_version")
        if not target or target == installed:
            raise RecuairApiError("No firmware update is available")
        self._firmware_update_started = self.hass.loop.time()
        self._firmware_update_target = target
        self._firmware_update_error = None
        self.async_set_updated_data(self._update_metadata(self.data or {}))
        try:
            await self.api.async_upgrade_firmware()
        except RecuairApiError:
            self._firmware_update_started = None
            self.async_set_updated_data(self._update_metadata(self.data or {}))
            raise
        await self.async_request_refresh()

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch the current device state once for all platforms."""
        if self.firmware_update_in_progress and self.hass.loop.time() - self._firmware_update_started >= 600:
            self._firmware_update_started = None
            self._firmware_update_error = "Firmware update was not confirmed within 10 minutes"
        try:
            device_data = await self.api.get_data()
        except RecuairApiError as err:
            if self.firmware_update_in_progress:
                # Keep the last readings, including their original timestamp,
                # while update state explains the expected network outage.
                return self._update_metadata(self.data or {})
            raise UpdateFailed(str(err)) from err
        if self.firmware_update_in_progress and device_data.get("firmware_version") == self._firmware_update_target:
            self._firmware_update_started = None
            self._firmware_update_error = None
        device_data["last_successful_update"] = dt_util.utcnow()
        return self._update_metadata(device_data)
