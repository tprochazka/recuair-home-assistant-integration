# Recuair Home Assistant Integration

This is a custom component for [Home Assistant](https://www.home-assistant.io/) to integrate with [Recuair DC40](https://www.recuair.com/) ventilation units. It allows you to monitor your Recuair unit's status directly from Home Assistant by reading data from its local web interface.

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

## Install with HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tprochazka&repository=recuair&category=integration)
[![Add integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=recuair)

1. Install and configure [HACS](https://www.hacs.dev/docs/use/download/download/) once if it is not already available.
2. Click **Open in HACS** above and add the repository. Alternatively, add `https://github.com/tprochazka/recuair` under HACS **Custom repositories**, category **Integration**.
3. Download **RecuAir DC40**, then restart Home Assistant.
4. Click **Add integration** above, or use **Settings → Devices & Services → Add Integration → Recuair**.
5. Confirm discovered DC40 units or enter their local IP addresses manually.

HACS downloads the published `recuair.zip` release asset and offers future version updates. This is the same package used for manual installation. The repository's development branch is not the installable release. Minimum supported Home Assistant version: **2026.9.0**.

## Manual installation

1. Download `recuair.zip` from the [latest release](https://github.com/tprochazka/recuair/releases/latest).
2. Extract its contents into `/config/custom_components/recuair/`. The resulting file must be `/config/custom_components/recuair/manifest.json`; do not add an extra directory level.
3. Restart Home Assistant and add the integration as described above.

The package contains both the integration and the optional dashboard. It does not require HACS, additional dashboard-card integrations, or internet access to control units locally. My Home Assistant buttons only open the relevant screen; they do not silently install or configure anything.

## Optional dashboard

The dashboard lists all devices created by this integration and offers room-level and whole-home controls. Its JavaScript is included in the integration and loaded automatically; there is no separate frontend package or Resources entry to maintain.

To use it in the UI:

1. Open your dashboard and choose **Edit dashboard → Add card**.
2. Search for **RecuAir Dashboard** and add the card. Reload the browser after the initial installation if the card is not listed yet.
3. For a dedicated full-width page, create a view with **Panel (1 card)** layout and add this card to it. [dashboard/recuair.yaml](dashboard/recuair.yaml) is an optional YAML example.

The dashboard is optional: installing the integration never creates or changes your dashboards. Standard Home Assistant entities remain usable independently.

**Migration from the earlier development setup:** remove the old `/local/recuair-dashboard.js?...` entry from **Settings → Dashboards → Resources**, then reload the browser. Existing `custom:recuair-dashboard-v2` cards continue to work. The old `/config/www/recuair-dashboard.js` file can then be deleted. Keeping the old resource may load an outdated card before the bundled version.

The all-units card can set automatic, manual, bypass and holiday modes for every discovered DC40, control all unit lights, and turn every unit off. A newly added DC40 appears on the dashboard automatically after Home Assistant has created its entities.

Dashboard labels follow the Home Assistant profile language: Czech for cs, English otherwise. Device and area names remain user-defined.

While the dashboard is visible, the integration polls every 10 seconds and refreshes immediately when it opens. When all dashboards are hidden or closed, it returns to the configured Scan Interval (60 seconds by default). Multiple dashboards share the same polling loop. If a client disconnects without notifying Home Assistant, its activity lease expires after 35 seconds.

The dashboard shows warning chips for available firmware and filter-service reminders. Each action requires confirmation. Firmware updates use the native Home Assistant update entity and the DC40 `update-cloud` endpoint used by the Android app. During installation, last readings remain visible and controls are disabled. The update is confirmed only after the target firmware version returns; after ten minutes without confirmation, normal unavailable reporting resumes. Filter reminders can be reset after replacing the filters. They also appear under **Settings → Repairs**, with warning severity when replacement is due and error severity when filter lifetime reaches zero. The repair dialog requires explicit confirmation before resetting the unit and closes only after a fresh, valid filter reading confirms success. Outages or incomplete responses retain the issue.

## Configuration

During the setup process, you will be prompted to enter the following information:

- **Host**: The local IP address of your Recuair ventilation unit (e.g., `192.168.1.123`).
- **Scan Interval** Periodical check interval for new data, default is 60 seconds and minimum is 10 seconds.

## Tests and development packages

GitHub Actions runs Python regression tests and dashboard checks on every push and pull request. Successful runs provide `recuair.zip` and `SHA256SUMS.txt` in **Artifacts** (retained for 30 days). These are development builds; the downloadable release is on the repository's **Releases** page.

Pushing a `v<version>` tag runs the same checks before publishing a GitHub release with this single package and its checksum. The tag must match `manifest.json`; beta/RC versions are published as prereleases. HACS uses the release ZIP, so its contents are identical to the manual download.

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
