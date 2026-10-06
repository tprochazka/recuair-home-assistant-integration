"""Binary status entities for Recuair."""
from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MODEL
from .coordinator import RecuairCoordinator
from .identity import device_identifiers, entry_identifier, mac_connection


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Recuair power state."""
    coordinator: RecuairCoordinator = hass.data[DOMAIN][entry.entry_id]
    device_info = DeviceInfo(
        identifiers=device_identifiers(entry),
        connections=mac_connection(entry),
        name=entry.title,
        manufacturer="Recuair",
        model=MODEL,
        configuration_url=coordinator.api.configuration_url,
    )
    async_add_entities([
        RecuairPower(coordinator, entry, device_info),
        RecuairFilterReplacementNeeded(coordinator, entry, device_info),
    ])


class RecuairPower(CoordinatorEntity, BinarySensorEntity):
    """Report whether the DC40 ventilation unit is switched on."""

    _attr_has_entity_name = True
    _attr_name = "Power"
    _attr_device_class = BinarySensorDeviceClass.POWER

    def __init__(
        self, coordinator: RecuairCoordinator, entry: ConfigEntry, device_info: DeviceInfo
    ) -> None:
        """Initialize the power status entity."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_identifier(entry)}_power"
        self._attr_device_info = device_info

    @property
    def is_on(self) -> bool | None:
        """Return the power state reported by the status page."""
        if self.coordinator.data is None:
            return None
        return self.coordinator.data.get("power_on")


class RecuairFilterReplacementNeeded(CoordinatorEntity, BinarySensorEntity):
    """Report the filter-service condition used by the reset control."""

    _attr_has_entity_name = True
    _attr_name = "Filter Replacement Needed"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(
        self, coordinator: RecuairCoordinator, entry: ConfigEntry, device_info: DeviceInfo
    ) -> None:
        """Initialize the filter service status entity."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_identifier(entry)}_filter_replacement_needed"
        self._attr_device_info = device_info

    @property
    def is_on(self) -> bool | None:
        """Return whether the DC40 requests filter replacement."""
        if self.coordinator.data is None:
            return None
        return self.coordinator.data.get("filter_reset_available")
