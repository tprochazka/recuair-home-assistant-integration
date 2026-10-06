"""Test lease timing independently of a running Home Assistant."""
import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch


class CoordinatorBase:
    def _schedule_refresh(self):
        self.schedules += 1

    async def async_shutdown(self):
        self.stopped = True


def load_coordinator():
    modules = {}
    for name in ("homeassistant", "homeassistant.core", "homeassistant.helpers",
                 "homeassistant.helpers.event", "homeassistant.helpers.update_coordinator",
                 "homeassistant.util", "homeassistant.util.dt", "lease_test", "lease_test.api", "lease_test.const"):
        modules[name] = types.ModuleType(name)
    CoordinatorBase.__class_getitem__ = classmethod(lambda cls, item: cls)
    modules["homeassistant.core"].HomeAssistant = object
    modules["homeassistant.core"].callback = lambda fn: fn
    modules["homeassistant.helpers.update_coordinator"].DataUpdateCoordinator = CoordinatorBase
    modules["homeassistant.helpers.update_coordinator"].UpdateFailed = RuntimeError
    modules["homeassistant.helpers.event"].async_call_later = lambda hass, delay, callback: hass.timers.schedule(delay, callback)
    modules["homeassistant.util"].dt = modules["homeassistant.util.dt"]
    modules["homeassistant.util.dt"].utcnow = lambda: "now"
    modules["lease_test.api"].RecuairApi = object
    modules["lease_test.api"].RecuairApiError = RuntimeError
    modules["lease_test.const"].DOMAIN = "recuair"
    path = Path(__file__).parents[1] / "custom_components/recuair/coordinator.py"
    spec = importlib.util.spec_from_file_location("lease_test.coordinator", path)
    module = importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules, modules):
        spec.loader.exec_module(module)
    return module.RecuairCoordinator


class Timers:
    def schedule(self, delay, callback):
        self.delay, self.callback = delay, callback
        return lambda: None


class DashboardActivityTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        from datetime import timedelta
        self.now = 0
        cls = load_coordinator()
        self.coordinator = cls.__new__(cls)
        self.coordinator.hass = types.SimpleNamespace(
            loop=types.SimpleNamespace(time=lambda: self.now), timers=Timers())
        self.coordinator._background_interval = timedelta(seconds=60)
        self.coordinator.update_interval = timedelta(seconds=60)
        self.coordinator._dashboard_clients = {}
        self.coordinator._cancel_dashboard_expiry = None
        self.coordinator.schedules = 0
        self.coordinator._firmware_update_started = None
        self.coordinator._firmware_update_target = None
        self.coordinator._firmware_update_error = None

    def test_multiple_clients_do_not_multiply_or_reset_polling(self):
        c = self.coordinator
        self.assertTrue(c.async_dashboard_activity("phone", True))
        self.assertEqual(c.update_interval.total_seconds(), 10)
        self.assertFalse(c.async_dashboard_activity("browser", True))
        self.now = 15
        self.assertFalse(c.async_dashboard_activity("phone", True))
        self.assertEqual(c.schedules, 1)
        c.async_dashboard_activity("phone", False)
        self.assertEqual(c.update_interval.total_seconds(), 10)
        c.async_dashboard_activity("browser", False)
        self.assertEqual(c.update_interval.total_seconds(), 60)

    def test_lost_connection_expires_without_another_poll(self):
        c = self.coordinator
        c.async_dashboard_activity("phone", True)
        self.now = 36
        c.hass.timers.callback()
        self.assertEqual(c.update_interval.total_seconds(), 60)
        self.assertFalse(c._dashboard_clients)

    async def test_unload_cancels_activity(self):
        c = self.coordinator
        c.async_dashboard_activity("phone", True)
        await c.async_shutdown()
        self.assertFalse(c._dashboard_clients)
        self.assertIsNone(c._cancel_dashboard_expiry)
        self.assertTrue(c.stopped)

    async def test_update_keeps_last_readings_until_target_version_returns(self):
        c = self.coordinator
        c._firmware_update_started = 0
        c._firmware_update_target = "18.0"
        c.data = {"firmware_version": "17.5", "last_successful_update": "before"}
        async def offline():
            raise RuntimeError("offline during reboot")
        c.api = types.SimpleNamespace(get_data=offline)
        self.now = 30
        data = await c._async_update_data()
        self.assertTrue(data["firmware_update_in_progress"])
        self.assertEqual(data["last_successful_update"], "before")
        async def old_version():
            return {"firmware_version": "17.5"}
        c.api.get_data = old_version
        self.assertTrue((await c._async_update_data())["firmware_update_in_progress"])
        async def new_version():
            return {"firmware_version": "18.0"}
        c.api.get_data = new_version
        self.assertFalse((await c._async_update_data())["firmware_update_in_progress"])

    async def test_update_timeout_stops_masking_a_real_outage(self):
        c = self.coordinator
        c._firmware_update_started = 0
        c._firmware_update_target = "18.0"
        c.data = {"firmware_version": "17.5"}
        async def offline():
            raise RuntimeError("offline")
        c.api = types.SimpleNamespace(get_data=offline)
        self.now = 601
        with self.assertRaises(RuntimeError):
            await c._async_update_data()
        self.assertFalse(c.firmware_update_in_progress)
        self.assertIn("10 minutes", c._firmware_update_error)

    async def test_firmware_start_waits_for_filter_reset_lock(self):
        from unittest.mock import AsyncMock
        c = self.coordinator
        c.maintenance_lock = asyncio.Lock()
        c._async_start_firmware_update = AsyncMock()
        async with c.maintenance_lock:
            task = asyncio.create_task(c.async_start_firmware_update())
            await asyncio.sleep(0)
            c._async_start_firmware_update.assert_not_awaited()
        await task
        c._async_start_firmware_update.assert_awaited_once()
