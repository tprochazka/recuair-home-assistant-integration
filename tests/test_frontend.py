"""Check automatic card registration without touching user dashboards."""
import hashlib
import importlib.util
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import AsyncMock, Mock, patch


class FrontendTest(unittest.IsolatedAsyncioTestCase):
    def load_frontend(self):
        modules = {name: types.ModuleType(name) for name in (
            "homeassistant", "homeassistant.components", "homeassistant.components.frontend",
            "homeassistant.components.http", "homeassistant.core", "homeassistant.loader",
        )}
        frontend = modules["homeassistant.components.frontend"]
        frontend.add_extra_js_url = Mock()
        modules["homeassistant.components"].frontend = frontend
        modules["homeassistant.components.http"].StaticPathConfig = lambda *args: args
        modules["homeassistant.core"].HomeAssistant = object
        loader = modules["homeassistant.loader"]
        loader.async_get_integration = AsyncMock(return_value=types.SimpleNamespace(version="0.2.0"))
        source = Path(__file__).parents[1] / "custom_components/recuair/frontend.py"
        spec = importlib.util.spec_from_file_location("frontend_test", source)
        module = importlib.util.module_from_spec(spec)
        with patch.dict(sys.modules, modules):
            spec.loader.exec_module(module)
        return module, frontend, loader

    async def test_bundled_asset_registered_with_version_without_resource_storage(self):
        module, frontend, loader = self.load_frontend()
        hass = types.SimpleNamespace(
            config=types.SimpleNamespace(components={"frontend"}),
            async_add_executor_job=AsyncMock(side_effect=lambda fn: fn()),
            http=types.SimpleNamespace(async_register_static_paths=AsyncMock()),
        )
        await module.async_setup_frontend(hass)
        paths = hass.http.async_register_static_paths.call_args.args[0]
        self.assertEqual(paths[0][0], "/recuair_static")
        self.assertTrue((Path(paths[0][1]) / "recuair-dashboard.js").is_file())
        self.assertFalse(paths[0][2])
        content_hash = hashlib.sha256((Path(paths[0][1]) / "recuair-dashboard.js").read_bytes()).hexdigest()[:16]
        frontend.add_extra_js_url.assert_called_once_with(
            hass, f"/recuair_static/recuair-dashboard.js?v=0.2.0&h={content_hash}")

    async def test_headless_installation_does_not_require_http_or_frontend(self):
        module, frontend, loader = self.load_frontend()
        await module.async_setup_frontend(types.SimpleNamespace(
            config=types.SimpleNamespace(components=set())))
        frontend.add_extra_js_url.assert_not_called()
        loader.async_get_integration.assert_not_awaited()
