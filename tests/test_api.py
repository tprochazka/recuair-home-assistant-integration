"""Focused contract tests for the local Recuair HTTP client."""
from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest


API_PATH = Path(__file__).parents[1] / "custom_components" / "recuair" / "api.py"
SPEC = importlib.util.spec_from_file_location("recuair_api", API_PATH)
assert SPEC and SPEC.loader
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)


class Response:
    """Small async response fake."""

    status = 303

    def raise_for_status(self) -> None:
        return None

    async def text(self) -> str:
        return '<span class="deviceName">Obývák</span>'


class Request:
    """Async context manager around a response."""

    def __init__(self, response: Response) -> None:
        self.response = response

    async def __aenter__(self) -> Response:
        return self.response

    async def __aexit__(self, *_args) -> None:
        return None


class Session:
    """Record outgoing client requests."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict]] = []

    def post(self, url: str, **kwargs):
        self.calls.append(("post", url, kwargs))
        return Request(Response())

    def get(self, url: str, **kwargs):
        self.calls.append(("get", url, kwargs))
        response = Response()
        response.status = 200
        return Request(response)


class SettingsSession(Session):
    """Return RGB values for the settings endpoint."""

    def get(self, url: str, **kwargs):
        self.calls.append(("get", url, kwargs))
        response = Response()
        response.status = 200

        async def text() -> str:
            return (
                '<input name="r" value="12"><input name="g" value="34">'
                '<input name="b" value="56">'
            )

        response.text = text
        return Request(response)


class RecuairApiTest(unittest.IsolatedAsyncioTestCase):
    """Verify paths and readable data without controlling a real unit."""

    async def test_light_uses_setting_endpoint_and_full_payload(self) -> None:
        session = Session()
        api = API.RecuairApi("192.168.1.235", session)

        await api.async_set_light(3, 12, 34, 56)

        method, url, kwargs = session.calls[0]
        self.assertEqual(method, "post")
        self.assertEqual(url, "http://192.168.1.235/setting")
        self.assertEqual(
            kwargs["data"], {"r": "12", "g": "34", "b": "56", "intensity": "3"}
        )

    async def test_mode_uses_root_endpoint(self) -> None:
        session = Session()
        api = API.RecuairApi("192.168.1.235", session)

        await api.async_set_mode("auto")

        _method, url, kwargs = session.calls[0]
        self.assertEqual(url, "http://192.168.1.235/")
        self.assertEqual(kwargs["data"], {"mode": "auto"})

    async def test_light_off_preserves_rgb_for_the_next_turn_on(self) -> None:
        session = Session()
        api = API.RecuairApi("192.168.1.235", session)

        await api.async_light_off(12, 34, 56)
        await api.async_set_light(5, 12, 34, 56)

        self.assertEqual(
            session.calls[0][2]["data"],
            {"r": "12", "g": "34", "b": "56", "intensity": "0"},
        )
        self.assertEqual(
            session.calls[1][2]["data"],
            {"r": "12", "g": "34", "b": "56", "intensity": "5"},
        )

    async def test_light_rgb_is_read_from_settings_page(self) -> None:
        session = SettingsSession()
        api = API.RecuairApi("192.168.1.235", session)

        rgb = await api.async_get_light_rgb()

        self.assertEqual(rgb, (12, 34, 56))
        self.assertEqual(session.calls[0][1], "http://192.168.1.235/setting")

    async def test_status_page_returns_parsed_data(self) -> None:
        session = Session()
        api = API.RecuairApi("192.168.1.235", session)

        data = await api.get_data()

        self.assertEqual(data["device_name"], "Obývák")
        self.assertEqual(session.calls[0][1], "http://192.168.1.235/")
