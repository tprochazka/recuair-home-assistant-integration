# RecuAir Home Assistant Integration

This is a custom component for [Home Assistant](https://www.home-assistant.io/) to integrate with [Recuair DC40](https://www.recuair.com/) ventilation units. It allows you to monitor your Recuair unit's status directly from Home Assistant by reading data from its local web interface.

An optional [custom dashboard](#optional-custom-dashboard) is included, with room cards, sensor readings and controls for individual units or all units at once.

## How it Works

This integration scrapes the local web interface of the Recuair unit, as no official API is available. It uses `aiohttp` for asynchronous web requests and `BeautifulSoup` for HTML parsing to extract sensor data.

## Features

Once configured, the integration will create the following sensors in Home Assistant:

- **CO2 Level**: Current CO2 concentration (ppm)
- **Room Temperature**: Indoor temperature (°C)
- **Outside Temperature**: Outdoor temperature (°C)
- **Humidity**: Indoor humidity (%)
- **Ventilation Intensity**: Current fan speed (%)
- **Filter Status**: Remaining filter life (%)
- **Mode**: Current operating mode (e.g., AUTO, MANUAL)
- **Light Intensity**: On-device light intensity level (0-5)

It also provides control entities:

- **Light**: Native Home Assistant light entity (`light.xxx`) with on/off, brightness and RGB color control
- **Mode (Select)**: `auto`, `off`, `holiday`, `bypass`, `1`, `2`, `3`, `4`
- **Light Intensity (Number)**: 0-5

## Installation

Install the integration first, then follow [Configuration](#configuration) to connect your units. Both installation methods include the optional dashboard.

### HACS (recommended)

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tprochazka&repository=recuair-home-assistant-integration&category=integration)

1. Install and configure [HACS](https://www.hacs.dev/docs/use/download/download/) once if it is not already available.
2. Click **Open in HACS** above and add the repository. Alternatively, add `https://github.com/tprochazka/recuair-home-assistant-integration` under HACS **Custom repositories**, category **Integration**.
3. Download **RecuAir DC40**, then restart Home Assistant.
4. Continue with [Configuration](#configuration).

HACS downloads the published `recuair.zip` release asset and offers future version updates. This is the same package used for manual installation. The repository's development branch is not the installable release. Minimum supported Home Assistant version: **2026.9.0**.

### Manual installation

1. Download `recuair.zip` from the [latest release](https://github.com/tprochazka/recuair-home-assistant-integration/releases/latest).
2. Extract its contents into `/config/custom_components/recuair/`. The resulting file must be `/config/custom_components/recuair/manifest.json`; do not add an extra directory level.
3. Restart Home Assistant and continue with [Configuration](#configuration).

The package contains both the integration and the optional dashboard. It does not require HACS, additional dashboard-card integrations, or internet access to control units locally. My Home Assistant buttons only open the relevant screen; they do not silently install or configure anything.

## Configuration

[![Add integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=recuair)

After installation and a Home Assistant restart:

1. Confirm automatically discovered DC40 units under **Settings → Devices & Services**, or click **Add integration** above to enter a unit manually.
2. Enter its **Host** (local IP address, for example `192.168.1.123`) and **Scan Interval** (60 seconds by default, minimum 10 seconds).
3. Repeat for each unit. Existing configured units do not need to be added again after an update.

You can also start manual setup through **Settings → Devices & Services → Add Integration → Recuair**. Change the background Scan Interval later using **Configure** on the unit's integration entry.

## Updates

HACS checks GitHub for new releases and offers updates in Home Assistant. Install the offered update and restart Home Assistant; reload open dashboard pages afterward. The integration and its bundled dashboard update together. HACS does not install updates automatically unless you configure an automation for that purpose.

For a manual installation, download the [latest release](https://github.com/tprochazka/recuair-home-assistant-integration/releases/latest), replace `/config/custom_components/recuair/` with the extracted package and restart Home Assistant. Your configured units and dashboards remain stored in Home Assistant.

Release downloads are hosted in this GitHub repository, not in a separate HACS package store. HACS tracks published releases rather than every development commit. The **latest release** link always opens the most recent stable release.

## Optional custom dashboard

The dashboard lists all devices created by this integration and offers room-level and whole-home controls. Its JavaScript is included in the integration and loaded automatically; there is no separate frontend package or Resources entry to maintain.

![RecuAir custom dashboard showing outdoor temperature, room readings, firmware notices and individual and all-unit controls](docs/images/recuair-dashboard.png)

- See CO₂, temperature, humidity and ventilation power for each room, plus an outdoor temperature average that excludes unusually warm readings.
- Control automatic, manual levels 1–4, bypass and holiday modes, power and ambient lighting for one unit or all units together. Long-press the light button to adjust brightness and color.
- Open a room card to view historical readings, and use firmware and filter chips to access maintenance actions.
- Cards appear automatically for configured units and inherit room names and icons from Home Assistant. The layout adapts to desktop and mobile screens.

To use it in the UI:

1. Open your dashboard and choose **Edit dashboard → Add card**.
2. Search for **RecuAir Dashboard** and add the card. Reload the browser after the initial installation if the card is not listed yet.
3. For a dedicated full-width page, create a view with **Panel (1 card)** layout and add this card to it. [dashboard/recuair.yaml](dashboard/recuair.yaml) is an optional YAML example.

The card type for YAML configuration is `custom:recuair-dashboard`.

The dashboard is optional: installing the integration never creates or changes your dashboards. Standard Home Assistant entities remain usable independently.

The all-units card appears only when two or more RecuAir units are configured. It can set automatic, manual, bypass and holiday modes for every configured DC40, control all unit lights, and turn every unit off. With one unit, only its individual card is shown. A newly added DC40 appears on the dashboard automatically after Home Assistant has created its entities.

Dashboard labels follow the Home Assistant profile language: Czech for cs, English otherwise. Device and area names remain user-defined.

Unit cards use the assigned Home Assistant area name when that area contains one RecuAir unit. With multiple RecuAir units in the same area, titles use **Area - Device name**. Units without an assigned area use their device name. Area icons are also inherited from Home Assistant.

While the dashboard is visible, the integration polls every 10 seconds and refreshes immediately when it opens. When all dashboards are hidden or closed, it returns to the configured Scan Interval (60 seconds by default). Multiple dashboards share the same polling loop. If a client disconnects without notifying Home Assistant, its activity lease expires after 35 seconds.

The dashboard shows warning chips for available firmware and filter-service reminders. Each action requires confirmation. Firmware updates use the native Home Assistant update entity and the DC40 `update-cloud` endpoint used by the Android app. During installation, last readings remain visible and controls are disabled. The update is confirmed only after the target firmware version returns; after ten minutes without confirmation, normal unavailable reporting resumes. Filter reminders can be reset after replacing the filters. They also appear under **Settings → Repairs**, with warning severity when replacement is due and error severity when filter lifetime reaches zero. The repair dialog requires explicit confirmation before resetting the unit and closes only after a fresh, valid filter reading confirms success. Outages or incomplete responses retain the issue.

## Tests and development packages

GitHub Actions runs Python regression tests and dashboard checks on every push and pull request. Successful runs provide `recuair.zip` and `SHA256SUMS.txt` in **Artifacts** (retained for 30 days). These are development builds; the downloadable release is on the repository's **Releases** page.

Pushing a `<version>` tag without a prefix (for example, `0.2.1`) runs the same checks before publishing a GitHub release with this single package and its checksum. The tag must exactly match the version in `manifest.json`; beta/RC versions are published as prereleases. HACS uses the release ZIP, so its contents are identical to the manual download.

To run the same checks locally:

```sh
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
node --check custom_components/recuair/frontend/recuair-dashboard.js
node tests/test_dashboard.cjs
python scripts/build_package.py
```

The tests use local fixtures and HA stubs; they do not contact ventilation units or verify the full Home Assistant runtime.

## Credits

Based on [pavelkrejsa/recuair](https://github.com/pavelkrejsa/recuair) and NightMean's [PR #3](https://github.com/pavelkrejsa/recuair/pull/3), which introduced HACS-compatible layout and discovery support. This fork extends that work with controls, maintenance workflows and an optional bundled dashboard.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
