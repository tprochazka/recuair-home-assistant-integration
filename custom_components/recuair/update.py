"""Native Home Assistant firmware update support for DC40."""
from homeassistant.components.update import UpdateEntity, UpdateEntityFeature, UpdateDeviceClass
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .api import RecuairApiError
from .entity import RecuairRoleMixin
from .const import MODEL
from .identity import device_identifiers, entry_identifier, mac_connection

async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = hass.data["recuair"][entry.entry_id]
    info = DeviceInfo(identifiers=device_identifiers(entry), connections=mac_connection(entry),
                      name=entry.title, manufacturer="Recuair", model=MODEL,
                      configuration_url=coordinator.api.configuration_url)
    async_add_entities([RecuairFirmwareUpdate(coordinator, entry, info)])

class RecuairFirmwareUpdate(RecuairRoleMixin, CoordinatorEntity, UpdateEntity):
    _attr_has_entity_name = True
    _attr_name = "Firmware"
    _recuair_role = "firmware"
    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_supported_features = UpdateEntityFeature.INSTALL | UpdateEntityFeature.PROGRESS

    def __init__(self, coordinator, entry, info):
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_identifier(entry)}_firmware"
        self._attr_device_info = info

    @property
    def installed_version(self):
        return (self.coordinator.data or {}).get("firmware_version")

    @property
    def latest_version(self):
        return (self.coordinator.data or {}).get("firmware_available_version") or self.installed_version

    @property
    def in_progress(self):
        return self.coordinator.firmware_update_in_progress

    @property
    def extra_state_attributes(self):
        return {"update_error": self.coordinator.firmware_update_error}

    async def async_install(self, version, backup, **kwargs):
        try:
            await self.coordinator.async_start_firmware_update()
        except RecuairApiError as err:
            raise HomeAssistantError(str(err)) from err
