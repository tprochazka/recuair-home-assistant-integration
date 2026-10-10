"""API for Recuair."""
from http import HTTPStatus
import logging
import re
import aiohttp
from bs4 import BeautifulSoup

_LOGGER = logging.getLogger(__name__)
_FILTER_WARNING_PATTERN = re.compile(r"(?i)\b(filtry|filters?)\b")


class RecuairApiError(Exception):
    """Error while communicating with Recuair."""

class RecuairApi:
    """Recuair API."""

    def __init__(self, ip_address: str, session: aiohttp.ClientSession):
        """Initialize the API."""
        self._ip_address = ip_address
        self._url = f"http://{self._ip_address}/"
        self._session = session

    @property
    def configuration_url(self) -> str:
        """Return the local web interface URL for this device."""
        return self._url

    async def _post_data(self, data: dict[str, str], path: str = "") -> None:
        """Send a POST request to the Recuair unit.

        Recuair uses redirects to indicate success for settings writes.
        """
        try:
            async with self._session.post(
                f"{self._url}{path}", data=data, allow_redirects=False, timeout=7
            ) as response:
                if response.status not in (
                    HTTPStatus.MOVED_PERMANENTLY,
                    HTTPStatus.SEE_OTHER,
                ):
                    raise RecuairApiError(
                        f"Unknown response status {response.status} for write operation"
                    )
        except (aiohttp.ClientError, TimeoutError) as err:
            raise RecuairApiError(f"Error writing to Recuair unit: {err}") from err

    async def async_set_mode(self, mode: str) -> None:
        """Set operation mode."""
        await self._post_data({"mode": mode})

    async def async_set_light(self, intensity: int, red: int, green: int, blue: int) -> None:
        """Set light values.

        Recuair requires full light payload even when only intensity changes.
        """
        await self._post_data(
            {
                "r": str(red),
                "g": str(green),
                "b": str(blue),
                "intensity": str(intensity),
            },
            path="setting",
        )

    async def async_light_off(self, red: int, green: int, blue: int) -> None:
        """Turn light off while retaining the chosen color for the next turn on."""
        await self.async_set_light(intensity=0, red=red, green=green, blue=blue)

    async def async_get_light_rgb(self) -> tuple[int, int, int]:
        """Read the current RGB values from the settings page before a write."""
        try:
            async with self._session.get(f"{self._url}setting", timeout=7) as response:
                response.raise_for_status()
                soup = BeautifulSoup(await response.text(), "html.parser")
        except (aiohttp.ClientError, TimeoutError) as err:
            raise RecuairApiError(f"Error reading Recuair settings: {err}") from err

        rgb = self._parse_light_rgb(soup)
        if rgb is None:
            raise RecuairApiError("Recuair settings page has no readable RGB value")
        return rgb

    @staticmethod
    def _parse_light_rgb(soup) -> tuple[int, int, int] | None:
        """Read current color from fields or the firmware 17.5 slider handler.

        Color preset buttons also contain RGB values, so only inspect the
        intensity slider's onchange attribute for the active color.
        """
        # The slider submits the active color. Firmware keeps the previous
        # custom RGB input values when the white preset is selected.
        slider = soup.find("input", {"name": "intensity"})
        handler = slider.get("onchange", "") if slider else ""
        payload = re.search(r"\bpostForm\s*\(\s*\{([^}]*)\}", handler)
        values = []
        if payload:
            for channel in ("r", "g", "b"):
                match = re.search(rf"(?:^|,)\s*{channel}\s*:\s*(\d+)\s*(?=,|$)", payload[1])
                if not match:
                    return None
                values.append(int(match[1]))
        else:
            for channel in ("r", "g", "b"):
                element = soup.find("input", {"name": channel})
                try:
                    values.append(int(element["value"]))
                except (KeyError, TypeError, ValueError):
                    return None
        if not all(0 <= value <= 255 for value in values):
            return None
        return (values[0], values[1], values[2])

    async def async_upgrade_firmware(self) -> bool:
        """Trigger the same update-cloud GET as Android, without retrying it.

        A dropped connection may be the updater restarting the device. False
        means acceptance was uncertain; subsequent status polls must confirm it.
        """
        try:
            async with self._session.get(
                f"{self._url}update-cloud", allow_redirects=False, timeout=7
            ) as response:
                if response.status not in (200, 202, 301, 302, 303, 307, 308):
                    raise RecuairApiError(f"Firmware update rejected: HTTP {response.status}")
                return True
        except (aiohttp.ServerDisconnectedError, aiohttp.ClientPayloadError, TimeoutError):
            return False
        except aiohttp.ClientError as err:
            raise RecuairApiError(f"Could not start firmware update: {err}") from err

    async def async_reset_filters(self) -> None:
        """Reset filter notification."""
        await self._post_data({"filterNotification": "1"}, path="setting")

    async def get_data(self) -> dict:
        """Get data from the Recuair unit."""
        try:
            async with self._session.get(self._url, timeout=7) as response:
                response.raise_for_status()
                html = await response.text()
                soup = BeautifulSoup(html, "html.parser")
                data = self._parse_data(soup)
                if not data.get("device_name") or not any(
                    key in data for key in (
                        "room_temperature", "co2", "mode", "filter_status",
                        "ventilation_intensity", "power_on",
                    )
                ):
                    raise RecuairApiError("Recuair returned a page without readable status")
                return data
        except RecuairApiError:
            raise
        except (aiohttp.ClientError, TimeoutError) as err:
            raise RecuairApiError(f"Error reading Recuair unit: {err}") from err
        except Exception as err:
            raise RecuairApiError(f"Could not parse Recuair status page: {err}") from err

    def _parse_data(self, soup):
        """Parse data from the HTML."""
        data = {}

        # Device Name
        device_name_span = soup.find("span", class_="deviceName")
        if device_name_span:
            data["device_name"] = device_name_span.text.strip()

        # Temperatures and Humidity
        temp_span = soup.find("span", class_="bigText")
        if temp_span:
            text = temp_span.text.strip()
            parts = text.split("/")
            if len(parts) == 2:
                # "25 °C / 45 % "
                room_temp_str = parts[0]
                humidity_str = parts[1].split("%")[0]
                try:
                    data["room_temperature"] = int(room_temp_str.replace("°C", "").strip())
                    data["humidity"] = int(humidity_str.strip())
                except ValueError:
                    pass # Could not parse

            # There is a second part of the span for outside temp
            outside_temp_i = temp_span.find("i", class_="logo_termo_2")
            if outside_temp_i:
                outside_temp_text = outside_temp_i.next_sibling
                if outside_temp_text:
                    try:
                        data["outside_temperature"] = int(outside_temp_text.replace("°C", "").strip())
                    except (ValueError, AttributeError):
                        pass # Could not parse

        # Mode
        button = soup.find("button", onclick="showModal('regimeModal')")
        if button and button.parent and button.parent.parent:
            mode_div = button.parent.parent.find_next("div")
            if mode_div:
                mode_span = mode_div.find("span", class_="bigText")
                if mode_span:
                    data["mode"] = mode_span.text.strip()


        # CO2
        co2_b = soup.find("b", string=lambda t: t and "ppm" in t)
        if co2_b:
            try:
                data["co2"] = int(co2_b.text.replace("ppm", "").strip())
            except ValueError:
                pass # Could not parse

        # Filter Status
        button = soup.find("button", onclick="showModal('filterModal')")
        if button and button.parent and button.parent.parent:
            filter_box = button.parent.parent.find_next_sibling("div", class_="filterBox")
            if filter_box:
                filter_div = filter_box.find("div")
                if filter_div and filter_div.has_attr("style"):
                    style = filter_div["style"] # "width: 60%"
                    try:
                        value = int(style.split(":")[1].replace("%", "").strip())
                        data["filter_status"] = 100 - value
                    except (ValueError, IndexError):
                        pass

        # Ventilation Intensity
        vent_header = soup.find(
            "span",
            string=lambda t: t
            and ("Ventilation intensity" in t or "Intenzita větrání" in t),
        )
        if vent_header:
            vent_box = vent_header.find_next("div", class_="bigText coText")
            if vent_box:
                vent_div = vent_box.find("div", class_="filterBox")
                if vent_div:
                    width_div = vent_div.find("div")
                    if width_div and width_div.has_attr("style"):
                        style = width_div["style"] # "width: 75%;"
                        try:
                            value = int(style.split(":")[1].replace("%;", "").replace("%", "").strip())
                            data["ventilation_intensity"] = 100 - value
                        except (ValueError, IndexError):
                            pass

        # Light Intensity
        intensity_input = soup.find("input", {"name": "intensity"})
        if intensity_input and intensity_input.has_attr("value"):
            try:
                data["light_intensity"] = int(intensity_input["value"])
            except (ValueError, TypeError):
                pass

        # Light Color
        rgb = self._parse_light_rgb(soup)
        if rgb is not None:
            data["light_rgb"] = rgb

        # Firmware Version
        fw_div = soup.find("div", string=lambda t: t and "fw:" in t)
        if fw_div:
            text = fw_div.text.strip()
            parts = text.split()
            for part in parts:
                if "fw:" in part:
                    fw_version = part.replace("fw:", "")
                    data["firmware_version"] = fw_version
                    break

        firmware_update_link = soup.find("a", href=lambda href: href and "upgrade" in href)
        if firmware_update_link:
            firmware_match = re.search(r"fw:([\d.]+)", firmware_update_link.get_text())
            if firmware_match:
                data["firmware_available_version"] = firmware_match.group(1)

        # A switch link that would submit `mode=off` means the unit is currently on.
        power_switch = soup.find("div", class_="logo_switch")
        if power_switch and power_switch.parent:
            data["power_on"] = "mode:'off'" in power_switch.parent.get("href", "")

        # DC40 warning dialogs are numbered from one when they contain active warnings.
        warnings = [
            element.get_text(" ", strip=True)
            for element in soup.find_all("div", id=re.compile(r"^errorModal[1-9]"))
            if element.get_text(" ", strip=True)
        ]
        if warnings:
            data["warnings"] = warnings
        data["filter_reset_available"] = (
            data.get("filter_status", 1) <= 0
            or any(_FILTER_WARNING_PATTERN.search(warning) for warning in warnings)
        )
        return data
