"""Filter replacement repairs with an explicitly confirmed hardware reset."""
from __future__ import annotations

import math
import voluptuous as vol

from homeassistant.components.repairs import RepairsFlow, RepairsFlowResult
from homeassistant.core import callback
from homeassistant.helpers import issue_registry as ir

from .api import RecuairApiError
from .const import DOMAIN


def filter_is_due(data: dict) -> bool:
    """Use the unit's replacement warning, not a guessed service interval."""
    return bool(data.get("filter_reset_available"))


def filter_is_exhausted(data: dict) -> bool:
    try:
        value = float(data.get("filter_status"))
    except (TypeError, ValueError):
        return False
    return math.isfinite(value) and value <= 0


def filter_is_resolved(data: dict) -> bool:
    """Missing readings must never confirm a reset or dismiss an issue."""
    try:
        value = float(data.get("filter_status"))
    except (TypeError, ValueError):
        return False
    return math.isfinite(value) and 0 < value <= 100 and not filter_is_due(data)


@callback
def async_sync_filter_issue(hass, entry, coordinator) -> None:
    """Retain an existing issue during outages or firmware installation."""
    if hass.data.get(DOMAIN, {}).get(entry.entry_id) is not coordinator:
        return
    if not coordinator.last_update_success or coordinator.firmware_update_in_progress:
        return
    issue_id = f"filter_{entry.entry_id}"
    if not filter_is_due(coordinator.data or {}):
        if filter_is_resolved(coordinator.data or {}):
            ir.async_delete_issue(hass, DOMAIN, issue_id)
        return
    ir.async_create_issue(
        hass, DOMAIN, issue_id,
        is_fixable=True, is_persistent=True,
        severity=ir.IssueSeverity.ERROR if filter_is_exhausted(coordinator.data) else ir.IssueSeverity.WARNING,
        translation_key="filter_exhausted" if filter_is_exhausted(coordinator.data) else "filter_replacement",
        translation_placeholders={"name": entry.title},
        data={"entry_id": entry.entry_id},
    )


class FilterRepairFlow(RepairsFlow):
    """Reset only after confirmation, and finish only after a verified reading."""

    async def async_step_init(self, user_input=None) -> RepairsFlowResult:
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input=None) -> RepairsFlowResult:
        entry_id = (self.data or {}).get("entry_id") or self.issue_id.removeprefix("filter_")
        entry = self.hass.config_entries.async_get_entry(entry_id) if entry_id else None
        if entry is None:
            return self.async_abort(reason="device_removed")
        coordinator = self.hass.data.get(DOMAIN, {}).get(entry_id)
        errors = {}
        if user_input is not None:
            if coordinator is None or coordinator.firmware_update_in_progress:
                errors["base"] = "device_unavailable"
            else:
                async with coordinator.maintenance_lock:
                    errors = await self._async_reset(coordinator)
                    if not errors:
                        return self.async_create_entry(data={})
        return self.async_show_form(
            step_id="confirm", data_schema=vol.Schema({}), errors=errors,
            description_placeholders={"name": entry.title},
        )


    def _coordinator_is_current(self, coordinator) -> bool:
        entry_id = (self.data or {}).get("entry_id") or self.issue_id.removeprefix("filter_")
        return (self.hass.config_entries.async_get_entry(entry_id) is not None
                and self.hass.data.get(DOMAIN, {}).get(entry_id) is coordinator)

    async def _async_reset(self, coordinator) -> dict:
        """Serialize confirmations and verify both pre- and post-command reads."""
        if not self._coordinator_is_current(coordinator):
            return {"base": "device_unavailable"}
        if coordinator.firmware_update_in_progress:
            return {"base": "device_unavailable"}
        # Bypass request-refresh debounce: both checks must be new reads.
        await coordinator.async_refresh()
        if not self._coordinator_is_current(coordinator) or not coordinator.last_update_success or coordinator.firmware_update_in_progress:
            return {"base": "device_unavailable"}
        if filter_is_resolved(coordinator.data or {}):
            return {}
        if not filter_is_due(coordinator.data or {}):
            return {"base": "cannot_verify"}
        try:
            await coordinator.api.async_reset_filters()
        except RecuairApiError:
            return {"base": "reset_failed"}
        await coordinator.async_refresh()
        if not self._coordinator_is_current(coordinator) or not coordinator.last_update_success or coordinator.firmware_update_in_progress:
            return {"base": "cannot_verify"}
        if filter_is_resolved(coordinator.data or {}):
            return {}
        return {"base": "not_confirmed" if filter_is_due(coordinator.data or {}) else "cannot_verify"}


async def async_create_fix_flow(hass, issue_id, data) -> RepairsFlow:
    """The Repairs manager supplies issue data to this flow."""
    return FilterRepairFlow()
