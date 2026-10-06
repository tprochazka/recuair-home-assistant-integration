"""Exercise repairs without contacting any physical unit."""
import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import AsyncMock, Mock, patch


class FlowBase:
    def async_show_form(self, **kwargs):
        return {"type": "form", **kwargs}

    def async_create_entry(self, **kwargs):
        return {"type": "create_entry", **kwargs}

    def async_abort(self, **kwargs):
        return {"type": "abort", **kwargs}


def load_repairs():
    names = ("homeassistant", "homeassistant.components", "homeassistant.components.repairs",
             "homeassistant.core", "homeassistant.helpers", "homeassistant.helpers.issue_registry",
             "repairs_test", "repairs_test.api", "repairs_test.const", "voluptuous")
    modules = {name: types.ModuleType(name) for name in names}
    modules["homeassistant.components.repairs"].RepairsFlow = FlowBase
    modules["homeassistant.components.repairs"].RepairsFlowResult = dict
    modules["homeassistant.core"].callback = lambda fn: fn
    registry = modules["homeassistant.helpers.issue_registry"]
    registry.IssueSeverity = types.SimpleNamespace(ERROR="error", WARNING="warning")
    registry.async_create_issue = Mock()
    registry.async_delete_issue = Mock()
    modules["homeassistant.helpers"].issue_registry = registry
    modules["repairs_test.api"].RecuairApiError = RuntimeError
    modules["repairs_test.const"].DOMAIN = "recuair"
    modules["voluptuous"].Schema = lambda schema: schema
    path = Path(__file__).parents[1] / "custom_components/recuair/repairs.py"
    spec = importlib.util.spec_from_file_location("repairs_test.repairs", path)
    module = importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules, modules):
        spec.loader.exec_module(module)
    return module, registry


class RepairsTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.module, self.registry = load_repairs()
        self.entry = types.SimpleNamespace(entry_id="living", title="Living room")
        self.coordinator = types.SimpleNamespace(
            last_update_success=True, firmware_update_in_progress=False, maintenance_lock=asyncio.Lock(),
            data={"filter_reset_available": True, "filter_status": 3},
            api=types.SimpleNamespace(async_reset_filters=AsyncMock()),
            async_refresh=AsyncMock())
        self.hass = types.SimpleNamespace(data={"recuair": {"living": self.coordinator}},
            config_entries=types.SimpleNamespace(async_get_entry=lambda id: self.entry))
        self.flow = self.module.FilterRepairFlow()
        self.flow.hass = self.hass
        self.flow.data = {"entry_id": "living"}

    def sync(self):
        self.module.async_sync_filter_issue(self.hass, self.entry, self.coordinator)

    def test_warning_error_and_recovery(self):
        self.sync()
        self.assertEqual(self.registry.async_create_issue.call_args.kwargs["severity"], "warning")
        self.coordinator.data["filter_status"] = 0
        self.sync()
        self.assertEqual(self.registry.async_create_issue.call_args.kwargs["severity"], "error")
        self.coordinator.data = {"filter_reset_available": False, "filter_status": 100}
        self.sync()
        self.registry.async_delete_issue.assert_called_once_with(self.hass, "recuair", "filter_living")

    def test_outages_and_update_do_not_delete_issue(self):
        self.coordinator.last_update_success = False
        self.sync()
        self.coordinator.last_update_success = True
        self.coordinator.firmware_update_in_progress = True
        self.sync()
        self.registry.async_delete_issue.assert_not_called()
        self.registry.async_create_issue.assert_not_called()

    def test_invalid_percent_is_not_zero(self):
        for value in (None, "", "unknown", "nan", "inf"):
            self.assertFalse(self.module.filter_is_exhausted({"filter_status": value}))

    async def test_opening_dialog_never_sends_reset(self):
        result = await self.flow.async_step_init()
        self.assertEqual(result["type"], "form")
        self.coordinator.api.async_reset_filters.assert_not_awaited()
        self.coordinator.async_refresh.assert_not_awaited()

    async def test_success_requires_fresh_confirmation(self):
        async def refresh():
            if self.coordinator.api.async_reset_filters.await_count:
                self.coordinator.data = {"filter_reset_available": False, "filter_status": 100}
        self.coordinator.async_refresh.side_effect = refresh
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["type"], "create_entry")
        self.assertEqual(self.coordinator.async_refresh.await_count, 2)
        self.coordinator.api.async_reset_filters.assert_awaited_once()

    async def test_reset_failure_keeps_dialog(self):
        self.coordinator.api.async_reset_filters.side_effect = RuntimeError("offline")
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "reset_failed"})

    async def test_unchanged_warning_does_not_report_success(self):
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "not_confirmed"})

    async def test_post_reset_outage_does_not_report_success(self):
        async def refresh():
            if self.coordinator.api.async_reset_filters.await_count:
                self.coordinator.last_update_success = False
        self.coordinator.async_refresh.side_effect = refresh
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "cannot_verify"})

    async def test_pre_reset_outage_prevents_command(self):
        self.coordinator.last_update_success = False
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "device_unavailable"})
        self.coordinator.api.async_reset_filters.assert_not_awaited()

    async def test_firmware_update_prevents_command(self):
        self.coordinator.firmware_update_in_progress = True
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "device_unavailable"})
        self.coordinator.api.async_reset_filters.assert_not_awaited()

    async def test_already_resolved_issue_needs_no_command(self):
        self.coordinator.data = {"filter_reset_available": False, "filter_status": 100}
        self.assertEqual((await self.flow.async_step_confirm({}))["type"], "create_entry")
        self.coordinator.api.async_reset_filters.assert_not_awaited()

    async def test_unloaded_entry_keeps_confirmation(self):
        self.hass.data["recuair"].clear()
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "device_unavailable"})

    async def test_removed_entry_aborts(self):
        self.hass.config_entries.async_get_entry = lambda id: None
        self.assertEqual((await self.flow.async_step_confirm({}))["reason"], "device_removed")

    async def test_incomplete_html_cannot_confirm_reset(self):
        async def refresh():
            if self.coordinator.api.async_reset_filters.await_count:
                self.coordinator.data = {"filter_reset_available": False}
        self.coordinator.async_refresh.side_effect = refresh
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "cannot_verify"})
        self.sync()
        self.registry.async_delete_issue.assert_not_called()

    async def test_concurrent_confirmations_send_only_one_reset(self):
        async def refresh():
            await asyncio.sleep(0)
            if self.coordinator.api.async_reset_filters.await_count:
                self.coordinator.data = {"filter_reset_available": False, "filter_status": 100}
        self.coordinator.async_refresh.side_effect = refresh
        results = await asyncio.gather(self.flow.async_step_confirm({}), self.flow.async_step_confirm({}))
        self.assertTrue(all(result["type"] == "create_entry" for result in results))
        self.coordinator.api.async_reset_filters.assert_awaited_once()

    async def test_unload_during_preflight_prevents_command(self):
        async def refresh():
            self.hass.data["recuair"].clear()
        self.coordinator.async_refresh.side_effect = refresh
        result = await self.flow.async_step_confirm({})
        self.assertEqual(result["errors"], {"base": "device_unavailable"})
        self.coordinator.api.async_reset_filters.assert_not_awaited()

    async def test_persistent_issue_without_data_recovers_entry_id(self):
        self.flow.data = None
        self.flow.issue_id = "filter_living"
        self.assertEqual((await self.flow.async_step_init())["type"], "form")

    def test_issue_survives_restart(self):
        self.sync()
        self.assertTrue(self.registry.async_create_issue.call_args.kwargs["is_persistent"])
