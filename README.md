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

1. In Home Assistant, open **HACS** and choose **Integrations**.
2. Open the HACS menu, select **Custom repositories**, and add `https://github.com/tprochazka/recuair` with category **Integration**.
3. Find **Recuair** in HACS and download it.
4. Restart Home Assistant to load the integration.
5. Go to **Settings** > **Devices & Services**, select **Add Integration**, and search for **Recuair**.

After installation, the DC40 should appear automatically in Home Assistant's discovered integrations. If it does not, add Recuair manually and enter its IP address.

## Dashboard

The included dashboard is dynamic: it lists every device created by this integration and offers both room-level and whole-home controls. It is styled after the Android app while remaining independent of HACS dashboard-card dependencies.

1. Copy [dashboard/recuair-dashboard.js](dashboard/recuair-dashboard.js) to Home Assistant's `/config/www/recuair-dashboard.js`.
2. In **Settings → Dashboards → Resources**, add `/local/recuair-dashboard.js` as a **JavaScript module**.
3. Create a YAML-mode dashboard and paste [dashboard/recuair.yaml](dashboard/recuair.yaml).

The all-units card can set automatic, manual, bypass and holiday modes for every discovered DC40, control all unit lights, and turn every unit off. A newly added DC40 appears on the dashboard automatically after Home Assistant has created its entities.

Dashboard labels follow the Home Assistant profile language: Czech for cs, English otherwise. Device and area names remain user-defined.

While the dashboard is visible, the integration polls every 10 seconds and refreshes immediately when it opens. When all dashboards are hidden or closed, it returns to the configured Scan Interval (60 seconds by default). Multiple dashboards share the same polling loop. If a client disconnects without notifying Home Assistant, its activity lease expires after 35 seconds.

The dashboard shows warning chips for available firmware and filter-service reminders. Each action requires confirmation. Firmware updates use the native Home Assistant update entity and the DC40 `update-cloud` endpoint used by the Android app. During installation, last readings remain visible and controls are disabled. The update is confirmed only after the target firmware version returns; after ten minutes without confirmation, normal unavailable reporting resumes. Filter reminders can be reset after replacing the filters. They also appear under **Settings → Repairs**, with warning severity when replacement is due and error severity when filter lifetime reaches zero. The repair dialog requires explicit confirmation before resetting the unit and closes only after a fresh, valid filter reading confirms success. Outages or incomplete responses retain the issue.

## Configuration

During the setup process, you will be prompted to enter the following information:

- **Host**: The local IP address of your Recuair ventilation unit (e.g., `192.168.1.123`).
- **Scan Interval** Periodical check interval for new data, default is 60 seconds and minimum is 10 seconds.

## Tests and development packages

GitHub Actions runs the Python regression tests and dashboard checks on every push and pull request. After successful checks it builds downloadable ZIPs under the run's **Artifacts** section (retained for 30 days):

- `recuair.zip`: integration files; extract into `/config/custom_components/recuair/`.
- `recuair-bundle.zip`: integration plus dashboard; extract into `/config/`, then add the dashboard resource and YAML view as described above.
- `SHA256SUMS.txt`: checksums of both ZIPs.

These are development artifacts, not automatic releases. HACS continues to use the repository's default branch or published releases; downloading a CI artifact does not publish a new HACS version. A future release can reuse the same packaging script.

To run the same checks locally:

```sh
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
node --check dashboard/recuair-dashboard.js
node tests/test_dashboard.cjs
python scripts/build_package.py
```

The tests use local fixtures and HA stubs; they do not contact ventilation units or verify the full Home Assistant runtime.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
