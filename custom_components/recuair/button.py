"""Service controls for Recuair."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .api import RecuairApiError
from .entity import RecuairRoleMixin
from .const import DOMAIN, MODEL
from .coordinator import RecuairCoordinator
from .identity import device_identifiers, entry_identifier, mac_connection


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Recuair service button."""
    coordinator: RecuairCoordinator = hass.data[DOMAIN][entry.entry_id]
    device_info = DeviceInfo(
        identifiers=device_identifiers(entry),
        connections=mac_connection(entry),
        name=entry.title,
        manufacturer="Recuair",
        model=MODEL,
        configuration_url=coordinator.api.configuration_url,
    )
    async_add_entities([RecuairResetFilterButton(coordinator, entry, device_info)])


class RecuairResetFilterButton(RecuairRoleMixin, CoordinatorEntity, ButtonEntity):
    """Reset the DC40 filter replacement reminder after a real filter change."""

    _attr_has_entity_name = True
    _attr_name = "Reset Filter Reminder"
    _attr_icon = "mdi:air-filter"

    _recuair_role = "reset_filter_reminder"

    def __init__(
        self, coordinator: RecuairCoordinator, entry: ConfigEntry, device_info: DeviceInfo
    ) -> None:
        """Initialize the filter-reset button."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_identifier(entry)}_reset_filter_reminder"
        self._attr_device_info = device_info

    @property
    def available(self) -> bool:
        """Expose the reset only when the DC40 reports filter service is due."""
        return super().available and bool(
            (self.coordinator.data or {}).get("filter_reset_available")
        )

    async def async_press(self) -> None:
        """Reset the reminder and then read the current state again."""
        async with self.coordinator.maintenance_lock:
            if self.coordinator.firmware_update_in_progress:
                raise HomeAssistantError("Cannot reset filters during a firmware update")
            try:
                await self.coordinator.api.async_reset_filters()
            except RecuairApiError as err:
                raise HomeAssistantError(str(err)) from err
            await self.coordinator.async_request_refresh()
