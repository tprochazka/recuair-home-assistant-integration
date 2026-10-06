"""Config flow for Recuair."""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlowResult
from homeassistant.const import CONF_HOST, CONF_SCAN_INTERVAL
from homeassistant.helpers.aiohttp_client import async_create_clientsession
from homeassistant.helpers.device_registry import format_mac
from homeassistant.helpers.service_info.dhcp import DhcpServiceInfo
from homeassistant.helpers.service_info.zeroconf import ZeroconfServiceInfo

from .api import RecuairApi, RecuairApiError
from .const import DOMAIN, MODEL

MIN_SCAN_INTERVAL = 10
DEFAULT_SCAN_INTERVAL = 60


def _device_title(device_name: str) -> str:
    """Include the supported model in a Home Assistant title."""
    if MODEL.casefold() in device_name.casefold():
        return device_name
    return f"{device_name} {MODEL}"


def _host_id(host: str) -> str:
    """Return a fallback identifier when a reliable MAC is unavailable."""
    return f"host:{host.casefold().rstrip('.')}"


async def async_read_name(hass, host: str) -> str | None:
    """Validate a Recuair status page and read the device name."""
    try:
        data = await RecuairApi(host, async_create_clientsession(hass)).get_data()
    except RecuairApiError:
        return None
    return data.get("device_name")


class RecuairConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle Recuair setup without destructive device identity migration."""

    VERSION = 1

    def _entry_for_host(self, host: str):
        """Find an already configured entry for exactly this configured host."""
        return next(
            (
                entry
                for entry in self._async_current_entries()
                if entry.options.get(CONF_HOST, entry.data.get(CONF_HOST)) == host
            ),
            None,
        )

    async def _async_handle_discovered_device(
        self, host: str, unique_id: str, device_name: str
    ) -> ConfigFlowResult:
        """Start confirmation for a discovered unit."""
        if self._entry_for_host(host) is not None:
            return self.async_abort(reason="already_configured")
        await self.async_set_unique_id(unique_id)
        existing_entry = next(
            (
                entry
                for entry in self._async_current_entries()
                if entry.unique_id == unique_id
            ),
            None,
        )
        if existing_entry is not None:
            updated_data = {**existing_entry.data, CONF_HOST: host}
            updated_options = dict(existing_entry.options)
            if CONF_HOST in updated_options:
                updated_options[CONF_HOST] = host
            self.hass.config_entries.async_update_entry(
                existing_entry, data=updated_data, options=updated_options
            )
            return self.async_abort(reason="already_configured")
        self._abort_if_unique_id_configured()
        device_title = _device_title(device_name)
        self.context["title_placeholders"] = {"name": device_title}
        self._discovered_host = host
        self._discovered_device_title = device_title
        return await self.async_step_discovery_confirm()

    async def async_step_dhcp(
        self, discovery_info: DhcpServiceInfo
    ) -> ConfigFlowResult:
        """Handle DHCP discovery, where the MAC is reliable."""
        host = discovery_info.ip
        device_name = await async_read_name(self.hass, host)
        if not device_name:
            return self.async_abort(reason="cannot_connect")
        return await self._async_handle_discovered_device(
            host, format_mac(discovery_info.macaddress), device_name
        )

    async def async_step_zeroconf(
        self, discovery_info: ZeroconfServiceInfo
    ) -> ConfigFlowResult:
        """Handle mDNS discovery even without a DHCP cache entry."""
        host = discovery_info.host
        device_name = await async_read_name(self.hass, host)
        if not device_name:
            return self.async_abort(reason="cannot_connect")
        return await self._async_handle_discovered_device(
            host, _host_id(host), device_name
        )

    async def async_step_discovery_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm a discovered Recuair device."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if user_input[CONF_SCAN_INTERVAL] < MIN_SCAN_INTERVAL:
                errors["base"] = "min_scan_interval"
            else:
                return self.async_create_entry(
                    title=self._discovered_device_title,
                    data={
                        CONF_HOST: self._discovered_host,
                        CONF_SCAN_INTERVAL: user_input[CONF_SCAN_INTERVAL],
                    },
                )
        return self.async_show_form(
            step_id="discovery_confirm",
            data_schema=vol.Schema({
                vol.Required(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): int
            }),
            description_placeholders={
                "model": self._discovered_device_title,
                "host": self._discovered_host,
            },
            errors=errors,
        )

    async def async_step_user(self, user_input=None):
        """Handle manually entered host addresses without a DHCP dependency."""
        errors: dict[str, str] = {}
        if user_input is not None:
            host = user_input[CONF_HOST]
            if user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL) < MIN_SCAN_INTERVAL:
                errors["base"] = "min_scan_interval"
            elif self._entry_for_host(host) is not None:
                return self.async_abort(reason="already_configured")
            else:
                device_name = await async_read_name(self.hass, host)
                if not device_name:
                    errors["base"] = "cannot_connect"
                else:
                    await self.async_set_unique_id(_host_id(host))
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(
                        title=_device_title(device_name), data=user_input
                    )
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_HOST): str,
                vol.Required(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): int,
            }),
            errors=errors,
        )

    @staticmethod
    def async_get_options_flow(config_entry):
        """Return the options flow."""
        return RecuairOptionsFlowHandler()


class RecuairOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle Recuair options."""

    async def async_step_init(self, user_input=None):
        """Update host and polling interval after validating the unit."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL) < MIN_SCAN_INTERVAL:
                errors["base"] = "min_scan_interval"
            elif await async_read_name(self.hass, user_input[CONF_HOST]):
                return self.async_create_entry(title="", data=user_input)
            else:
                errors["base"] = "cannot_connect"

        current_host = self.config_entry.options.get(
            CONF_HOST, self.config_entry.data.get(CONF_HOST, "")
        )
        current_scan = self.config_entry.options.get(
            CONF_SCAN_INTERVAL,
            self.config_entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required(CONF_HOST, default=current_host): str,
                vol.Optional(CONF_SCAN_INTERVAL, default=current_scan): int,
            }),
            errors=errors,
        )
