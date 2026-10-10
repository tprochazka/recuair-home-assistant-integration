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
        return '<span class="deviceName">Obývák</span><b>850 ppm</b>'


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

    def test_white_preset_overrides_stale_custom_color_fields(self) -> None:
        soup = API.BeautifulSoup("""
            <input name="r" value="0"><input name="g" value="0">
            <input name="b" value="255">
            <input name="intensity" value="3"
              onchange="postForm({r:255,g:255,b:255,intensity:this.value}, '/setting', '');">
        """, "html.parser")
        self.assertEqual(API.RecuairApi._parse_light_rgb(soup), (255, 255, 255))

    def test_light_color_from_firmware_17_5_slider_not_preset(self) -> None:
        soup = API.BeautifulSoup('''
          <button onclick="postForm({r:1,g:2,b:3,intensity:5},'/setting','')"></button>
          <input name="intensity" value="0"
            onchange="postForm( {r: 255, g: 3, b: 3,intensity:this.value}, '/setting' , '');">
        ''', "html.parser")
        api = API.RecuairApi("192.168.1.228", Session())
        self.assertEqual(api._parse_light_rgb(soup), (255, 3, 3))
        self.assertEqual(api._parse_data(soup)["light_rgb"], (255, 3, 3))

    def test_missing_or_invalid_color_is_not_guessed(self) -> None:
        for html in (
            '<input name="intensity" value="0">',
            '<input name="intensity" onchange="postForm({r:256,g:3,b:3})">',
            '<input name="intensity" onchange="postForm({r:12,g:3})">',
        ):
            with self.subTest(html=html):
                self.assertIsNone(API.RecuairApi._parse_light_rgb(API.BeautifulSoup(html, "html.parser")))

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

    def test_status_parser_reads_czech_status_and_diagnostics(self) -> None:
        api = API.RecuairApi("192.168.1.235", Session())
        soup = API.BeautifulSoup(
            """
            <span class="deviceName">Obývák</span>
            <span class="bigText"><i class="logo_termo_1"></i> 25 °C / 53 %
              <i class="logo_termo_2"></i> 22 °C</span>
            <button onclick="showModal('regimeModal')"></button><div><div>
              <div><span class="bigText">Režim 1</span></div></div></div>
            <b>876 ppm</b>
            <button onclick="showModal('filterModal')"></button><div><div></div></div>
            <div class="filterBox"><div style="width: 27%"></div></div>
            <span>Intenzita větrání </span><div class="bigText coText"><div class="filterBox">
              <div style="width: 75%"></div></div></div>
            <input name="intensity" value="3">
            <a href="javascript:postForm( {mode:'off'}, '/' , '');"><div class="logo_switch"></div></a>
            <div>ws:2.11 fw:17.5</div><a href="/upgrade">Upgrade fw:17.6</a>
            <div id="errorModal1">Filtry - vyměňte prosím</div>
            """,
            "html.parser",
        )

        data = api._parse_data(soup)

        self.assertEqual(data["ventilation_intensity"], 25)
        self.assertEqual(data["firmware_version"], "17.5")
        self.assertEqual(data["firmware_available_version"], "17.6")
        self.assertTrue(data["power_on"])
        self.assertEqual(data["warnings"], ["Filtry - vyměňte prosím"])
        self.assertTrue(data["filter_reset_available"])

    async def test_http_200_error_or_incomplete_page_is_not_success(self):
        for html in ("", "<h1>Starting up</h1>", '<span class="deviceName">Obývák</span>', '<b>850 ppm</b>'):
            session = Session()
            response = Response()
            async def text():
                return html
            response.text = text
            session.get = lambda *args, **kwargs: Request(response)
            with self.subTest(html=html), self.assertRaises(API.RecuairApiError):
                await API.RecuairApi("unit", session).get_data()


class FirmwareRequestTest(unittest.IsolatedAsyncioTestCase):
    async def test_upgrade_uses_android_get_endpoint_once(self):
        session = Session()
        api = API.RecuairApi("unit", session)
        self.assertTrue(await api.async_upgrade_firmware())
        self.assertEqual(session.calls, [("get", "http://unit/update-cloud", {"allow_redirects": False, "timeout": 7})])
