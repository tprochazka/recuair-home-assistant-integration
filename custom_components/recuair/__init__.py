"""The Recuair integration."""
import asyncio
import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import RecuairApi
from .config_flow import DEFAULT_SCAN_INTERVAL
from .const import DOMAIN
from .coordinator import RecuairCoordinator
from .repairs import async_sync_filter_issue
from .frontend import async_setup_frontend
from homeassistant.helpers import issue_registry as ir

PLATFORMS = ["sensor", "binary_sensor", "select", "number", "light", "button", "update"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Make the optional dashboard card available once per HA process."""
    await async_setup_frontend(hass)
    return True


async def _async_dashboard_activity(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle visible dashboard heartbeats without one poll per browser."""
    entries = set(call.data["entry_ids"])
    refresh = []
    for entry_id, coordinator in hass.data.get(DOMAIN, {}).items():
        if entry_id in entries:
            if coordinator.async_dashboard_activity(call.data["client_id"], call.data["active"]):
                refresh.append(coordinator.async_request_refresh())
        else:
            coordinator.async_dashboard_activity(call.data["client_id"], False)
    if refresh:
        await asyncio.gather(*refresh)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Recuair from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Options override data. Identity migration is deliberately not performed
    # during setup: a transient DHCP/mDNS observation must never rewrite or
    # remove a user's entities.
    host = entry.options.get(CONF_HOST, entry.data[CONF_HOST])
    scan_interval = entry.options.get(
        CONF_SCAN_INTERVAL, entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    )
    session = async_get_clientsession(hass)
    api = RecuairApi(host, session)
    coordinator = RecuairCoordinator(hass, api, scan_interval)
    await coordinator.async_config_entry_first_refresh()
    hass.data[DOMAIN][entry.entry_id] = coordinator
    entry.async_on_unload(coordinator.async_add_listener(
        lambda: async_sync_filter_issue(hass, entry, coordinator)
    ))
    async_sync_filter_issue(hass, entry, coordinator)
    if not hass.services.has_service(DOMAIN, "dashboard_activity"):
        async def handle_activity(call: ServiceCall) -> None:
            await _async_dashboard_activity(hass, call)

        hass.services.async_register(DOMAIN, "dashboard_activity", handle_activity, schema=vol.Schema({
            vol.Required("client_id"): vol.All(cv.string, vol.Length(min=1, max=100)),
            vol.Required("active"): cv.boolean,
            vol.Required("entry_ids"): vol.All(cv.ensure_list, [cv.string]),
        }))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Reload integration when options change
    entry.async_on_unload(entry.add_update_listener(update_listener))

    return True


async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update - reload the integration."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.async_shutdown()
        if not hass.data[DOMAIN]:
            hass.services.async_remove(DOMAIN, "dashboard_activity")

    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove persistent maintenance issues only when the device is removed."""
    ir.async_delete_issue(hass, DOMAIN, f"filter_{entry.entry_id}")
