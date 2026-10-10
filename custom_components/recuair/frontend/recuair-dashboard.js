// Vector paths reused from RecuAirExperiment AppIcons.kt and ic_bypass.xml.
const RECUAIR_ICONS = {"BeachAccess": ["M13.127,14.56L14.557,13.13L20.997,19.573L19.57,21L13.127,14.56ZM17.42,8.83L20.28,5.97C16.33,2.02 9.93,2.01 5.98,5.95C9.91,4.65 14.29,5.7 17.42,8.83ZM5.95,5.98C2.01,9.93 2.02,16.33 5.97,20.28L8.83,17.42C5.7,14.29 4.65,9.91 5.95,5.98ZM5.97,5.96L5.96,5.97C5.58,8.98 7.13,12.85 10.26,15.99L15.99,10.26C12.86,7.13 8.98,5.58 5.97,5.96Z"], "PowerSettingsNew": ["M13,3H11V13H13V3ZM17.83,5.17L16.42,6.58C17.99,7.86 19,9.81 19,12C19,15.87 15.87,19 12,19C8.13,19 5,15.87 5,12C5,9.81 6.01,7.86 7.58,6.58L6.17,5.17C4.23,6.82 3,9.26 3,12C3,16.97 7.03,21 12,21C16.97,21 21,16.97 21,12C21,9.26 19.77,6.82 17.83,5.17Z"], "HdrAuto": ["M12.04,8.04L11.95,8.04L10.35,12.59L13.64,12.59Z", "M12,2C6.48,2 2,6.48 2,12S6.48,22 12,22S22,17.52 22,12S17.52,2 12,2ZM15.21,17L14.23,14.19H9.78L8.78,17H6.88L11.01,6H12.98L17.11,17H15.21Z"], "LightbulbOutlined": ["M9,21C9,21.55 9.45,22 10,22H14C14.55,22 15,21.55 15,21V20H9V21ZM12,2C8.14,2 5,5.14 5,9C5,11.38 6.19,13.47 8,14.74V17C8,17.55 8.45,18 9,18H15C15.55,18 16,17.55 16,17V14.74C17.81,13.47 19,11.38 19,9C19,5.14 15.86,2 12,2ZM14.85,13.1L14,13.7V16H10V13.7L9.15,13.1C7.8,12.16 7,10.63 7,9C7,6.24 9.24,4 12,4S17,6.24 17,9C17,10.63 16.2,12.16 14.85,13.1Z"], "House": ["M19,9.3V4H16V6.6L12,3L2,12H5V20H11V14H13V20H19V12H22L19,9.3ZM17,18H15V12H9V18H7V10.19L12,5.69L17,10.19V18Z", "M10,10H14C14,8.9 13.1,8 12,8S10,8.9 10,10Z"], "Bypass": ["M20,16L23,13L20,10V12H18.748C17.86,8.55 14.728,6 11,6C7.272,6 4.14,8.55 3.252,12H1V14H5C5,10.686 7.686,8 11,8C14.314,8 17,10.686 17,14H20V16Z", "M15,14C15,16.209 13.209,18 11,18C8.791,18 7,16.209 7,14C7,11.791 8.791,10 11,10C13.209,10 15,11.791 15,14Z"]};
const RECUAIR_TEXT = {
  "cs": {
    "unit": "Rekuperace",
    "renderError": "Dashboard se nepodařilo vykreslit: {reason}",
    "retry": "Zkusit znovu",
    "commandError": "{name}: změna se nepodařila. Zobrazen je stav hlášený jednotkou.",
    "holidayAll": "Dovolená všech jednotek",
    "powerUnit": "Zapnout / vypnout jednotku",
    "auto": "Automatický režim",
    "manual": "Manuální výkon 1 až 4",
    "light": "Ambientní osvětlení",
    "brightness": "Intenzita světla",
    "close": "Zavřít",
    "firmwareChip": "Nový firmware {version}",
    "filterChip": "Výměna filtrů",
    "filterExpired": "Filtr vyčerpaný",
    "filterStopped": "Filtr vyčerpaný – jednotka vypnutá",
    "filterDays": "Filtry: zbývá {days} dnů",
    "confirmFirmware": "Chcete aktualizovat firmware z {from} na {to}?",
    "confirmFilter": "Chcete resetovat stav filtru po jeho výměně?",
    "yes": "Ano",
    "no": "Ne",
    "statusUpdating": "(probíhá aktualizace firmwaru…)",
    "updateFailed": "Aktualizace firmwaru se nepotvrdila. Zkontrolujte jednotku.",
    "color": "Barva světla",
    "colorAll": "Barva světla všech jednotek",
    "mixed": " (různé)",
    "outside": "VENKU · PRŮMĚR",
    "excluded": "Vynecháno z průměru: {names} (≥ 3 °C nad nejnižší teplotou)",
    "all": "VŠECHNY JEDNOTKY",
    "moreAll": "Další ovládání všech jednotek",
    "powerAll": "Zapnout / vypnout vše",
    "empty": "Nebyla nalezena žádná RecuAir DC40.",
    "temperature": "Teplota",
    "humidity": "Vlhkost",
    "power": "Výkon",
    "overview": "Přehled",
    "history": "{metric} za 24 hodin",
    "historyError": "Graf historie se nepodařilo načíst.",
    "moreUnit": "Další ovládání {name}",
    "holiday": "Dovolená",
    "holidayOn": "Zapnout režim dovolené",
    "holidayOff": "Vypnout režim dovolené",
    "on": "Zapnout",
    "off": "Vypnout",
    "warnings": "Upozornění",
    "statusUnavailable": "(jednotka nedostupná)",
    "statusOff": "(vypnuto)",
    "statusHoliday": "(režim dovolené)",
    "statusAutoBypass": "(auto bypass)"
  },
  "en": {
    "unit": "Ventilation unit",
    "renderError": "Failed to render dashboard: {reason}",
    "retry": "Try again",
    "commandError": "{name}: the change failed. Showing the state reported by the unit.",
    "holidayAll": "Holiday mode for all units",
    "powerUnit": "Turn unit on / off",
    "auto": "Automatic mode",
    "manual": "Manual level 1 to 4",
    "light": "Ambient lighting",
    "brightness": "Light intensity",
    "close": "Close",
    "firmwareChip": "New firmware {version}",
    "filterChip": "Replace filters",
    "filterExpired": "Filter expired",
    "filterStopped": "Filter expired – unit stopped",
    "filterDays": "Filters: {days} days remaining",
    "confirmFirmware": "Update firmware from {from} to {to}?",
    "confirmFilter": "Reset the filter reminder after replacing the filters?",
    "yes": "Yes",
    "no": "No",
    "statusUpdating": "(firmware update in progress…)",
    "updateFailed": "Firmware update was not confirmed. Check the unit.",
    "color": "Light color",
    "colorAll": "Light color for all units",
    "mixed": " (mixed)",
    "outside": "OUTSIDE · AVERAGE",
    "excluded": "Excluded from average: {names} (≥ 3 °C above the lowest reading)",
    "all": "ALL UNITS",
    "moreAll": "More controls for all units",
    "powerAll": "Turn all on / off",
    "empty": "No RecuAir DC40 units found.",
    "temperature": "Temperature",
    "humidity": "Humidity",
    "power": "Power",
    "overview": "Overview",
    "history": "{metric} over 24 hours",
    "historyError": "Failed to load history graph.",
    "moreUnit": "More controls for {name}",
    "holiday": "Holiday",
    "holidayOn": "Enable holiday mode",
    "holidayOff": "Disable holiday mode",
    "on": "Turn on",
    "off": "Turn off",
    "warnings": "Warnings",
    "statusUnavailable": "(unit unavailable)",
    "statusOff": "(off)",
    "statusHoliday": "(holiday mode)",
    "statusAutoBypass": "(auto bypass)"
  }
};
// HA installs its scoped custom-element registry during frontend startup.
// Extra modules may finish loading before that replacement. Wait before both
// capturing HTMLElement and registering the card in the final registry.
function registerRecuairDashboard() {
if (customElements.get("recuair-dashboard")) return;
class RecuairDashboard extends HTMLElement {
  _t(key, values = {}) {
    const language = (this._hass?.language || this._hass?.locale?.language || "en").toLowerCase();
    const text = RECUAIR_TEXT[language.startsWith("cs") ? "cs" : "en"][key] || key;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
  }

  _dashboardActivity(forceInactive = false) {
    if (!this._hass?.services?.recuair?.dashboard_activity) return;
    const active = !forceInactive && this.isConnected && document.visibilityState === "visible" && this.getClientRects().length > 0;
    const entry_ids = [...new Set(this._devices().flatMap((device) => this._hass.devices?.[device.id]?.config_entries || []))];
    this._activityDesired = active;
    if (this._activitySending) return;
    this._activitySending = true;
    this._hass.callService("recuair", "dashboard_activity", { client_id: this._activityClient, active, entry_ids }, undefined, false)
      .catch(() => {}) // The server lease expires even if closing the app drops this call.
      .finally(() => {
        this._activitySending = false;
        if (active !== this._activityDesired) this._dashboardActivity(!this._activityDesired);
      });
  }

  set hass(hass) {
    try {
      this._applyHass(hass);
    } catch (error) {
      // HA otherwise replaces the card with a generic permanent error card.
      // Keep this instance alive so the next state update can recover it.
      console.error("[RecuAir dashboard] State update failed", error);
      this._editing = false;
      this._openManualSelect = undefined;
      this._detailDeviceId = undefined;
      this._renderPending = false;
      this._lightColorEditing = this._lightSliderEditing = false;
      const reason = error?.message || String(error);
      this.innerHTML = `<ha-card role="alert" style="padding:24px"><p>${this._escape(this._t("renderError", { reason }))}</p><button data-render-retry>${this._t("retry")}</button></ha-card>`;
      this.querySelector("[data-render-retry]").addEventListener("click", () => { this.hass = this._hass; });
    }
  }

  _applyHass(hass) {
    this._hass = hass;
    this._reconcileCommands();
    if (this._activityClient && !this._activityStarted && hass.services?.recuair?.dashboard_activity) {
      this._activityStarted = true;
      this._dashboardActivity();
    }
    // A history card reloads its complete data series when it is recreated.
    // Keep an open detail stable; it is refreshed when the user returns to the overview.
    if (this._detailDeviceId) return;
    if (this._editing || this._openManualSelect) {
      this._renderPending = true;
      this._updateControls();
      return;
    }
    this.render();
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = config;
  }

  _entities() {
    return Object.values(this._hass?.entities || {}).filter(
      (entity) => entity.platform === "recuair" && entity.device_id,
    );
  }

  _devices() {
    const groups = new Map();
    for (const entity of this._entities()) {
      const group = groups.get(entity.device_id) || [];
      group.push(entity);
      groups.set(entity.device_id, group);
    }
    const areaCounts = new Map();
    for (const id of groups.keys()) {
      const areaId = this._hass.devices?.[id]?.area_id;
      if (areaId) areaCounts.set(areaId, (areaCounts.get(areaId) || 0) + 1);
    }
    return [...groups.entries()].map(([id, entities]) => {
      const device = this._hass.devices?.[id];
      const unitName = device?.name_by_user || device?.name || this._t("unit");
      const area = this._hass.areas?.[device?.area_id];
      const name = area?.name
        ? areaCounts.get(device.area_id) > 1 ? `${area.name} - ${unitName}` : area.name
        : unitName;
      return { id, entities, name, areaIcon: area?.icon };
    });
  }

  _find(device, suffix, domain) {
    return device.entities.find((entity) =>
      this._hass.states[entity.entity_id]?.attributes?.recuair_role === suffix.replace(/^_/, "") && (!domain || entity.entity_id.startsWith(`${domain}.`)),
    )?.entity_id;
  }

  _state(entityId, fallback = "–") {
    const optimistic = this._commands?.get(entityId);
    if (optimistic) return optimistic.state;
    const state = this._hass.states[entityId];
    if (!state || ["unknown", "unavailable"].includes(state.state)) return fallback;
    return state.state;
  }

  _value(entityId, suffix = "") {
    const value = this._state(entityId);
    return value === "–" ? value : `${value}${suffix}`;
  }

  _call(domain, service, data, target) {
    return this._hass.callService(domain, service, data, target ? { entity_id: target } : undefined);
  }

  _reconcileCommands() {
    for (const [id, command] of this._commands || []) {
      if (command.settled && this._hass.states[id]?.state === command.state) {
        clearTimeout(command.timer);
        this._commands.delete(id);
      }
    }
  }

  _refreshCommands() {
    if (this._detailDeviceId) return;
    if (this._editing || this._openManualSelect) {
      this._renderPending = true;
      this._updateControls();
    } else this.render();
  }

  _optimisticCall(domain, service, data, id, state, control = "light", origin = "", lightIntent) {
    if (!id) return;
    if (domain === "light" && (lightIntent || service === "turn_off" || data.rgb_color)) {
      this._lightIntents ||= new Map();
      // A later off/color command supersedes color samples not queued yet.
      // Brightness-only writes preserve the selected color instead.
      this._lightIntents.set(id, lightIntent || {});
    }
    this._commands ||= new Map();
    this._commandQueues ||= new Map();
    clearTimeout(this._commands.get(id)?.timer);
    const command = { state, control, origin, settled: false };
    if (domain === "light") {
      const previous = this._lightAttributes(id);
      command.attributes = {
        ...previous,
        brightness: state === "off" ? 0 : data.brightness ?? (previous.brightness > 0 ? previous.brightness : 255),
        ...(data.rgb_color ? { rgb_color: data.rgb_color } : {}),
      };
    }
    this._commands.set(id, command);
    this._commandError = "";
    this._refreshCommands();
    // Keep fast successive clicks in order for each unit. Different units run
    // independently; an older response must never revert a newer selection.
    const previous = this._commandQueues.get(id) || Promise.resolve();
    const pending = previous.then(async () => {
      try {
        await this._call(domain, service, data, id);
        if (this._commands.get(id) !== command) return;
        command.settled = true;
        this._reconcileCommands();
        if (this._commands.get(id) === command) {
          command.timer = setTimeout(() => {
            if (this._commands.get(id) !== command) return;
            this._commands.delete(id);
            this._refreshCommands();
          }, 5000);
        }
      } catch (error) {
        if (this._commands.get(id) !== command) return;
        this._commands.delete(id);
        const name = this._devices().find((device) => device.entities.some((entity) => entity.entity_id === id))?.name || this._t("unit");
        this._commandError = this._t("commandError", { name });
      } finally {
        this._refreshCommands();
      }
    });
    this._commandQueues.set(id, pending);
    pending.finally(() => {
      if (this._commandQueues.get(id) === pending) this._commandQueues.delete(id);
    });
    return pending;
  }

  _setEditing(editing) {
    this._editing = editing;
    if (!editing && this._renderPending) {
      this._renderPending = false;
      // Blur precedes the click on the next control. Replacing the card here
      // removes that click's target; update controls in place instead. Other
      // readings are rendered on the next HA update.
      this._updateControls();
    }
  }

  _escape(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  _icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${RECUAIR_ICONS[name].map((path) => `<path d="${path}"/>`).join("")}</svg>`;
  }

  _controlEntityState(id, group = false, fallback = "–") {
    if (!group || !this._commands?.has(id) || this._commands.get(id).origin === "all") return this._state(id, fallback);
    const reported = this._hass.states[id]?.state;
    return !reported || ["unknown", "unavailable"].includes(reported) ? fallback : reported;
  }

  _controlState(devices, group = false) {
    const state = (id, fallback = "–") => this._controlEntityState(id, group, fallback);
    const modeIds = devices.map((device) => this._find(device, "_mode", "select"));
    const modes = modeIds.map((id) => state(id, ""));
    const same = modes.length > 0 && modes.every((mode) => mode && mode === modes[0]);
    const mode = same ? modes[0] : "";
    const lights = devices.map((device) => this._find(device, "_light", "light"));
    const allOn = lights.length > 0 && lights.every((id) => state(id) === "on");
    const pending = new Set([...modeIds, ...lights].map((id) => this._commands?.get(id)).filter((command) => command && (!group || command.origin === "all")).map((command) => command.control));
    return { mode, same, allOn, pending, manual: ["1", "2", "3", "4"].includes(mode) };
  }

  _updateControls() {
    const devices = this._devices();
    this.querySelectorAll("[data-controls]").forEach((controls) => {
      const group = controls.dataset.controls === "all";
      const selected = group ? devices : devices.filter((device) => device.id === controls.dataset.controls);
      const { mode, same, allOn, manual, pending } = this._controlState(selected, group);
      controls.querySelectorAll("button, select").forEach((control) => { control.disabled = selected.some((device) => this._isUpdating(device)); });
      const active = { power: same && mode !== "off", holiday: mode === "holiday", bypass: mode === "bypass", auto: mode === "auto", light: allOn };
      controls.querySelectorAll("[data-control]").forEach((button) => {
        button.classList.toggle("primary", active[button.dataset.control]);
        button.setAttribute("aria-pressed", String(!!active[button.dataset.control]));
        button.classList.toggle("pending", pending.has(button.dataset.control));
        button.setAttribute("aria-busy", String(pending.has(button.dataset.control)));
      });
      const select = controls.querySelector("select");
      select.classList.toggle("primary", manual);
      select.classList.toggle("pending", pending.has("manual"));
      select.setAttribute("aria-busy", String(pending.has("manual")));
      select.value = manual ? mode : "";
      select.options[0].textContent = same ? "1" : "?";
    });
    // Keep menus/selects mounted while updating every state-dependent label.
    // This preserves focus and native dropdowns during optimistic updates.
    this.querySelectorAll("article[data-device]").forEach((card) => {
      const device = devices.find((item) => item.id === card.dataset.device);
      if (!device) return;
      const mode = this._state(this._find(device, "_mode", "select"), "");
      const notices = card.querySelector("[data-notices]");
      if (notices) notices.innerHTML = this._notificationChips(device);
      card.querySelectorAll("[data-control], [data-manual], [data-light-settings]").forEach((control) => { control.disabled = this._isUpdating(device); });
      const heading = card.querySelector("[data-unit-heading]");
      if (heading) heading.innerHTML = `${this._escape(device.name)}${this._deviceStatus(device)}`;
      const holiday = card.querySelector('.unit-menu [data-control="holiday"]');
      if (holiday) {
        holiday.textContent = this._t(mode === "holiday" ? "holidayOff" : "holidayOn");
        holiday.hidden = mode === "off";
      }
      const power = card.querySelector('.unit-menu [data-control="power"]');
      if (power) power.textContent = this._t(mode === "off" ? "on" : "off");
      const color = card.querySelector("[data-unit-color]");
      if (color) color.hidden = mode === "off";
    });
    this.querySelectorAll('.group .unit-menu button').forEach((button) => { button.disabled = devices.some((device) => this._isUpdating(device)); });
    this._updateLightPopup();
    const error = this.querySelector("[data-command-error]");
    if (error) {
      error.textContent = this._commandError || "";
      error.hidden = !this._commandError;
    }
  }

  _controls(devices, group = false) {
    const { mode, same, allOn, manual, pending } = this._controlState(devices, group);
    const target = group ? "all" : devices[0].id;
    const button = (action, icon, label, active) => `<button class="round ${active ? "primary" : ""} ${pending.has(action) ? "pending" : ""}" data-control="${action}" data-target="${target}" aria-label="${label}" title="${label}" aria-pressed="${!!active}" aria-busy="${pending.has(action)}">${this._icon(icon)}</button>`;
    return `<div class="controls android-controls" data-controls="${target}">
      ${button(group ? "holiday" : "power", group ? "BeachAccess" : "PowerSettingsNew", group ? this._t("holidayAll") : this._t("powerUnit"), group ? mode === "holiday" : same && mode !== "off")}
      <span class="control-spacer"></span>
      ${button("bypass", "Bypass", "Bypass", mode === "bypass")}
      ${button("auto", "HdrAuto", this._t("auto"), mode === "auto")}
      <select class="round manual ${manual ? "primary" : ""} ${pending.has("manual") ? "pending" : ""}" data-manual="${target}" aria-label="${this._t("manual")}" title="${this._t("manual")}" aria-busy="${pending.has("manual")}">
        <option value="" disabled hidden ${manual ? "" : "selected"}>${same ? "1" : "?"}</option>
        ${[1,2,3,4].map((level) => `<option value="${level}" ${mode === String(level) ? "selected" : ""}>${level}</option>`).join("")}
      </select>
      ${button("light", "LightbulbOutlined", this._t("light"), allOn)}
    </div>`;
  }

  _handleControl(button) {
    const devices = button.dataset.target === "all" ? this._devices() : this._devices().filter((device) => device.id === button.dataset.target);
    if (devices.some((device) => this._isUpdating(device))) return;
    const action = button.dataset.control;
    const state = (id) => this._controlEntityState(id, button.dataset.target === "all", "");
    if (action === "light") {
      const ids = devices.map((device) => this._find(device, "_light", "light")).filter(Boolean);
      const allOn = ids.length > 0 && ids.every((id) => state(id) === "on");
      ids.forEach((id) => this._optimisticCall("light", allOn ? "turn_off" : "turn_on", {}, id, allOn ? "off" : "on", "light", button.dataset.target));
      return;
    }
    const ids = devices.map((device) => this._find(device, "_mode", "select")).filter(Boolean);
    const allActive = ids.length > 0 && ids.every((id) => action === "power" ? state(id) !== "off" : state(id) === action);
    const option = action === "power" ? (allActive ? "off" : "auto") : action === "auto" ? "auto" : allActive ? "auto" : action;
    ids.forEach((id) => this._optimisticCall("select", "select_option", { option }, id, option, action, button.dataset.target));
  }

  _deviceIcon(device) {
    return device.areaIcon
      ? `<ha-icon icon="${this._escape(device.areaIcon)}" aria-hidden="true"></ha-icon>`
      : this._icon("House");
  }

  _colorControl(devices, target) {
    const colors = devices.map((device) => this._hass.states[this._find(device, "_light", "light")]?.attributes?.rgb_color);
    const same = colors.length > 0 && colors.every((color) => color?.length === 3 && color.every((value, index) => value === colors[0]?.[index]));
    const hex = (same ? colors[0] : [255, 255, 255]).map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("");
    return `<label class="color-row"><span>${this._t("color")}${devices.length > 1 && !same ? this._t("mixed") : ""}</span><input type="color" value="#${hex}" data-color="${target}" aria-label="${this._t(target === "all" ? "colorAll" : "color")}"></label>`;
  }

  _handleColor(input) {
    if (!/^#[0-9a-f]{6}$/i.test(input.value)) return;
    const rgb_color = [1, 3, 5].map((offset) => parseInt(input.value.slice(offset, offset + 2), 16));
    const devices = input.dataset.color === "all" ? this._devices() : this._devices().filter((device) => device.id === input.dataset.color);
    if (devices.some((device) => this._isUpdating(device))) return;
    return Promise.all(devices.map((device) => this._find(device, "_light", "light")).filter(Boolean)
      .filter((id) => !input.intents || this._lightIntents?.get(id) === input.intents.get(id))
      .map((id) => this._optimisticCall("light", "turn_on", { rgb_color }, id, "on", "light", input.dataset.color, input.intents?.get(id))));
  }

  _previewColor(input) {
    const target = input.dataset.color;
    if (!/^#[0-9a-f]{6}$/i.test(input.value)) return;
    const devices = target === "all" ? this._devices() : this._devices().filter((device) => device.id === target);
    if (devices.some((device) => this._isUpdating(device))) return;
    this._lightIntents ||= new Map();
    const intents = new Map();
    for (const device of devices) {
      const id = this._find(device, "_light", "light");
      if (!id) continue;
      const intent = {};
      this._lightIntents.set(id, intent);
      intents.set(id, intent);
    }
    const sample = { value: input.value, intents };
    this._colorPreviews ||= new Map();
    const existing = this._colorPreviews.get(target);
    if (existing) {
      existing.sample = sample;
      return existing.promise;
    }
    const preview = { sample };
    this._colorPreviews.set(target, preview);
    // Apply the first selection immediately. While a write is in flight,
    // retain only the latest selection instead of queuing every drag event.
    // Keep draining after the picker closes so the last choice is persisted.
    preview.promise = (async () => {
      try {
        while (preview.sample) {
          const sample = preview.sample;
          preview.sample = undefined;
          await this._handleColor({ ...sample, dataset: { color: target } });
        }
      } finally {
        this._colorPreviews.delete(target);
      }
    })();
    return preview.promise;
  }

  _lightAttributes(id) {
    return this._commands?.get(id)?.attributes || this._hass.states[id]?.attributes || {};
  }

  _updateLightPopup() {
    const popup = this.querySelector(".light-popup");
    if (!popup) return;
    const target = popup.dataset.lightTarget;
    const devices = target === "all" ? this._devices() : this._devices().filter((device) => device.id === target);
    const ids = devices.map((device) => this._find(device, "_light", "light"));
    const levels = ids.map((id) => this._state(id) === "on" ? Math.round((this._lightAttributes(id).brightness || 0) * 5 / 255) : 0);
    const same = levels.length > 0 && levels.every((level) => level === levels[0]);
    if (!this._lightSliderEditing) {
      popup.querySelector('input[type="range"]').value = same ? levels[0] : 3;
      popup.querySelector("output").textContent = same ? levels[0] : this._t("mixed");
    }
    const colors = ids.map((id) => this._lightAttributes(id).rgb_color);
    if (!this._lightColorEditing && !this._colorPreviews?.has(target)) {
      if (colors[0]?.length === 3 && colors.every((color) => color?.every((value, index) => value === colors[0][index]))) {
        const color = popup.querySelector("[data-color]");
        color.value = "#" + colors[0].map((value) => value.toString(16).padStart(2, "0")).join("");
        // Deduplicate input/change only while this value remains selected.
        // A failed command or an external color change must allow a retry.
        popup.dataset.selectedColor = color.value;
      } else {
        // Mixed or unavailable group colors must allow reapplying the selection.
        delete popup.dataset.selectedColor;
      }
    }
  }

  _closeLightPopup() {
    this._lightSliderEditing = this._lightColorEditing = false;
    this.querySelector(".light-popup")?.remove();
    this._setEditing(false);
  }

  _openLightPopup(anchor, target) {
    const rect = anchor.getBoundingClientRect();
    this.querySelectorAll("details[open]").forEach((menu) => { menu.open = false; });
    this.querySelector(".light-popup")?.remove();
    this._setEditing(true);
    const devices = target === "all" ? this._devices() : this._devices().filter((device) => device.id === target);
    if (devices.some((device) => this._isUpdating(device))) { this._setEditing(false); return; }
    const levels = devices.map((device) => {
      const entity = this._hass.states[this._find(device, "_light", "light")];
      return entity?.state === "on" ? Math.round((entity.attributes.brightness || 0) * 5 / 255) : 0;
    });
    const same = levels.length > 0 && levels.every((level) => level === levels[0]);
    const popup = document.createElement("div");
    popup.className = "light-popup";
    popup.dataset.lightTarget = target;
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", this._t("light"));
    popup.innerHTML = `<div class="light-popup-head"><strong>${this._t("light")}</strong><button data-light-close aria-label="${this._t("close")}">×</button></div>
      ${this._colorControl(devices, target)}
      <label class="brightness-row">${this._t("brightness")} <output>${same ? levels[0] : this._t("mixed")}</output>
        <input type="range" min="0" max="5" step="1" value="${same ? levels[0] : 3}" aria-label="${this._t("brightness")}"></label>`;
    this.append(popup);
    const width = popup.offsetWidth, height = popup.offsetHeight;
    popup.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.right - width))}px`;
    popup.style.top = `${Math.max(12, Math.min(window.innerHeight - height - 12, rect.top - height - 8))}px`;
    popup.querySelector("[data-light-close]").addEventListener("click", () => this._closeLightPopup());
    const color = popup.querySelector("[data-color]");
    color.addEventListener("focus", () => { this._lightColorEditing = true; });
    const previewColor = () => {
      if (popup.dataset.selectedColor === color.value) return;
      popup.dataset.selectedColor = color.value;
      this._previewColor(color);
    };
    // Chrome emits input while its native picker is still open; mobile
    // pickers may commit only with change. Blur must never restore old RGB.
    color.addEventListener("input", previewColor);
    color.addEventListener("change", previewColor);
    color.addEventListener("blur", () => { this._lightColorEditing = false; });
    const slider = popup.querySelector('input[type="range"]');
    slider.addEventListener("input", () => { this._lightSliderEditing = true; popup.querySelector("output").textContent = slider.value; });
    slider.addEventListener("change", () => {
      this._lightSliderEditing = false;
      if (devices.some((device) => this._isUpdating(device))) { this._updateLightPopup(); return; }
      const level = Number(slider.value);
      const brightness = Math.round(level * 255 / 5);
      devices.forEach((device) => this._optimisticCall("light", level ? "turn_on" : "turn_off", level ? { brightness } : {}, this._find(device, "_light", "light"), level ? "on" : "off", "light", target));
    });
    popup.addEventListener("click", (event) => event.stopPropagation());
    popup.addEventListener("keydown", (event) => { if (event.key === "Escape") { event.stopPropagation(); this._closeLightPopup(); } });
    this._updateLightPopup();
    popup.querySelector("[data-light-close]").focus({ preventScroll: true });
  }

  _bindLightPress(button) {
    let timer, origin, held = false, moved = false, suppressClick = false;
    const clearTimer = () => { clearTimeout(timer); timer = undefined; };
    button.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      clearTimer();
      origin = { x: event.clientX, y: event.clientY, id: event.pointerId };
      held = moved = suppressClick = false;
      this._longPressButton = undefined;
      this._setEditing(true);
      button.setPointerCapture(event.pointerId);
      timer = setTimeout(() => { held = true; }, 500);
    });
    button.addEventListener("pointermove", (event) => {
      if (!origin || event.pointerId !== origin.id) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
        moved = true;
        clearTimer();
      }
    });
    button.addEventListener("pointercancel", () => {
      clearTimer();
      origin = undefined;
      suppressClick = true;
      this._setEditing(false);
    });
    button.addEventListener("pointerup", (event) => {
      if (!origin || event.pointerId !== origin.id) return;
      clearTimer();
      origin = undefined;
      suppressClick = held || moved;
      if (!held || moved) return;
      this._longPressButton = button;
      this._openLightPopup(button, button.dataset.target);
    });
    button.addEventListener("contextmenu", (event) => event.preventDefault());
    button.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
        if (!this.querySelector(".light-popup")) this._setEditing(false);
        return;
      }
      this._handleControl(button);
      this._setEditing(false);
    });
  }

  _outsideTemperatureSnapshot(devices, now = Date.now()) {
    // Same high-outlier rule as RecuAirExperiment's RecuState:
    // discard readings at least 3 °C above the lowest available reading.
    const readings = devices.flatMap((device) => {
      const entity = this._hass.states[this._find(device, "_outside_temperature", "sensor")];
      if (!entity || ["unknown", "unavailable", ""].includes(entity.state)) return [];
      const value = Number(entity.state);
      if (!Number.isFinite(value)) return [];
      // last_updated is not a poll timestamp: unchanged temperatures may remain
      // valid for hours. Apply Android's 3-minute limit only to last_reported,
      // when HA supplies it; otherwise rely on integration availability.
      const reported = Date.parse(entity.last_reported);
      if (Number.isFinite(reported) && now - reported > 180000) return [];
      return [{ device, value }];
    });
    if (!readings.length) return { average: null, excluded: [] };
    const minimum = Math.min(...readings.map((reading) => reading.value));
    const included = readings.filter((reading) => reading.value - minimum < 3);
    const excluded = readings.filter((reading) => reading.value - minimum >= 3);
    return {
      average: included.reduce((sum, reading) => sum + reading.value, 0) / included.length,
      excluded,
    };
  }

  connectedCallback() {
    this._activityClient ||= (crypto.randomUUID?.() || Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, "0")).join(""));
    this._activityStarted = false;
    this._visibilityChanged = () => this._dashboardActivity();
    this._pageHiding = () => this._dashboardActivity(true);
    document.addEventListener("visibilitychange", this._visibilityChanged);
    window.addEventListener("pagehide", this._pageHiding);
    this._heartbeat = setInterval(() => this._dashboardActivity(), 15000);
    this._dashboardActivity();
    this._dismissMenu = (event) => {
      if (this.querySelector(".notice-dialog[open]")) return;
      const menus = [...this.querySelectorAll("details[open]")];
      const path = event.composedPath();
      if (this._openManualSelect && !path.includes(this._openManualSelect)) {
        this._openManualSelect = undefined;
        event.preventDefault();
        event.stopImmediatePropagation();
        this._setEditing(false);
        return;
      }
      if (this._longPressButton && path.includes(this._longPressButton)) {
        this._longPressButton = undefined;
        return;
      }
      const popup = this.querySelector(".light-popup");
      if (popup && !path.includes(popup)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        menus.forEach((menu) => { menu.open = false; });
        this._closeLightPopup();
        return;
      }
      if (!menus.length || menus.some((menu) => path.includes(menu))) return;
      // Consume the dismissing click before a room card can open its graphs.
      event.preventDefault();
      event.stopImmediatePropagation();
      menus.forEach((menu) => { menu.open = false; });
      this._setEditing(false);
    };
    document.addEventListener("click", this._dismissMenu, true);
    this.render();
  }

  disconnectedCallback() {
    clearInterval(this._heartbeat);
    document.removeEventListener("visibilitychange", this._visibilityChanged);
    window.removeEventListener("pagehide", this._pageHiding);
    this._dashboardActivity(true);
    document.removeEventListener("click", this._dismissMenu, true);
    this._openManualSelect = undefined;
  }

  render() {
    if (!this._hass) return;
    const devices = this._devices();
    const outside = this._outsideTemperatureSnapshot(devices);
    const average = outside.average === null ? "–" : outside.average.toFixed(1);
    const excludedNames = outside.excluded.map((reading) => reading.device.name).join(", ");
    const detailDevice = devices.find((device) => device.id === this._detailDeviceId);
    if (detailDevice) {
      this._renderDetail(detailDevice);
      return;
    }
    const cards = devices.map((device) => this._deviceCard(device)).join("");

    this.innerHTML = `
      <style>
        :host { display: block; }
        .shell { color: var(--primary-text-color); font-family: var(--primary-font-family); max-width: 1440px; margin: 0 auto; padding: 24px 32px; box-sizing: border-box; }
        .outside, .group, .unit { background: var(--card-background-color); border-radius: 28px; padding: 20px; box-shadow: var(--ha-card-box-shadow, none); }
        .units > * { min-width: 0; }
        .group { display: flex; flex-direction: column; }
        .outside { margin: 14px 0; }
        .units { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 14px 0; }
        .outside { text-align: center; background: color-mix(in srgb, var(--primary-color) 20%, var(--card-background-color)); }
        .eyebrow { color: var(--primary-color); font-size: 1rem; margin-bottom: 6px; }
        .outside-note { margin-top: 8px; font-size: .85rem; color: var(--secondary-text-color); }
        .temperature { font-size: 2.6rem; font-weight: 400; }
        h2 { margin: 0 0 16px; font-size: 1.25rem; }
        button { border: 0; border-radius: 999px; padding: 12px 8px; min-height: 52px; min-width: 52px; background: var(--secondary-background-color); color: var(--primary-text-color); cursor: pointer; font: inherit; }
        button.primary { background: var(--primary-color); color: var(--text-primary-color, white); }
        .unit-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .unit-title { font-size: 1.35rem; font-weight: 500; }
        .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
        .metric { text-align: center; padding: 8px 2px; }
        .metric label { display: block; color: var(--primary-color); font-size: .85rem; margin-bottom: 4px; }
        .metric strong { font-size: 1.35rem; font-weight: 400; }
        .controls { display: flex; align-items: center; gap: 10px; border-top: 1px solid var(--divider-color); margin-top: 12px; padding-top: 12px; }
        .group .controls { margin-top: auto; }
        select { flex: 1; min-height: 52px; border: 0; border-radius: 999px; padding: 0 52px 0 16px; background: var(--secondary-background-color); color: var(--primary-text-color); font: inherit; }
        .android-controls { gap: 12px; }
        .round { width: 56px; height: 56px; min-width: 56px; min-height: 56px; padding: 12px; border-radius: 50%; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; }
        svg { width: 28px; height: 28px; fill: currentColor; flex-shrink: 0; }
        .unit-title ha-icon { --mdc-icon-size: 28px; width: 28px; height: 28px; flex-shrink: 0; }
        .unit-title { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .unit-title > span { overflow-wrap: anywhere; }
        .unit-title { flex-wrap: wrap; }
        .notice-chips { display: inline-flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; margin-left: auto; }
        .notice-chip { font-size: .75rem; font-weight: 500; border-radius: 8px; padding: 5px 9px; min-height: 28px; background: color-mix(in srgb, var(--warning-color, #ff9800) 20%, var(--card-background-color)); color: var(--warning-color, #ffb74d); }
        .notice-chip.notice-error { background: color-mix(in srgb, var(--error-color, #db4437) 20%, var(--card-background-color)); color: var(--error-color, #db4437); }
        .notice-dialog { max-width: min(420px, calc(100vw - 48px)); border: 0; border-radius: 18px; padding: 24px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
        .notice-dialog::backdrop { background: #0008; }
        .notice-dialog > div { display: flex; justify-content: flex-end; gap: 12px; }
        .notice-dialog button { min-height: 40px; padding: 8px 18px; border-radius: 8px; }
        .notice-dialog [data-yes] { background: var(--primary-color); color: var(--text-primary-color, white); }
        .control-spacer { flex: 1; }
        select.manual { flex: none; appearance: none; text-align: center; text-align-last: center; padding: 0; font-size: 24px; cursor: pointer; }
        select.manual.primary { background: var(--primary-color); color: var(--text-primary-color, white); }
        [hidden] { display: none !important; }
        .unit-status { font-weight: 400; font-size: .85em; opacity: .85; }
        .unit-status.status-warning { color: var(--warning-color, #ff9800); }
        .round.pending { animation: recuair-pending-glow 1.4s ease-in-out infinite; }
        @keyframes recuair-pending-glow {
          0%, 100% { box-shadow: 0 0 3px 0 color-mix(in srgb, var(--primary-color) 12%, transparent); }
          50% { box-shadow: 0 0 10px 2px color-mix(in srgb, var(--primary-color) 30%, transparent); }
        }
        @media (prefers-reduced-motion: reduce) { .round.pending { animation: none; box-shadow: 0 0 6px 1px color-mix(in srgb, var(--primary-color) 22%, transparent); } }
        .round:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; }
        button[data-control="light"] { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: pan-y; }
        @media (max-width: 900px) { .round { width: 48px; height: 48px; min-width: 48px; min-height: 48px; } .android-controls { gap: 6px; } }
        .light-popup { position: fixed; z-index: 10; width: min(300px, calc(100vw - 24px)); padding: 12px; box-sizing: border-box; border-radius: 16px; background: var(--card-background-color); color: var(--primary-text-color); box-shadow: 0 5px 30px #0008; }
        .light-popup-head { display: flex; align-items: center; justify-content: space-between; padding-left: 16px; }
        .light-popup-head button { border-radius: 50%; padding: 6px; min-width: 36px; min-height: 36px; font-size: 24px; }
        .brightness-row { display: block; padding: 12px 16px; }
        .brightness-row output { float: right; }
        .brightness-row input { display: block; width: 100%; margin-top: 14px; accent-color: var(--primary-color); }
        .unit-menu { position: relative; flex-shrink: 0; }
        .unit-menu summary { cursor: pointer; list-style: none; padding: 8px 12px; font-size: 24px; }
        .menu-items { position: absolute; right: 0; z-index: 2; display: grid; width: max-content; min-width: 180px; padding: 6px 0; border-radius: 12px; background: var(--card-background-color); box-shadow: 0 4px 20px #0005; }
        .menu-items button, .color-row { border-radius: 0; padding: 10px 16px; min-height: 44px; background: transparent; text-align: left; white-space: nowrap; }
        .menu-items button:hover, .color-row:hover { background: var(--secondary-background-color); }
        .color-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; box-sizing: border-box; }
        .color-row input { width: 36px; height: 30px; padding: 0; border: 0; background: transparent; cursor: pointer; }
        .warning { margin-top: 12px; color: var(--warning-color); }
        @media (max-width: 650px) { .shell { padding: 12px; } .units { grid-template-columns: 1fr; } }
        @media (max-width: 500px) {
          .unit, .group { padding: 14px; }
          .round { width: clamp(36px, 10vw, 48px); height: clamp(36px, 10vw, 48px); min-width: 36px; min-height: 36px; padding: 6px; }
          .android-controls { gap: 2px; }
          .unit-title { font-size: 1.05rem; }
          .metrics { gap: 4px; } .metric strong { font-size: 1rem; } .metric label { font-size: .75rem; }
        }
      </style>
      <section class="shell">
        <div class="warning" role="alert" data-command-error ${this._commandError ? "" : "hidden"}>${this._escape(this._commandError || "")}</div>
        <div class="outside"><div class="eyebrow">${this._t("outside")}</div><div class="temperature">${average} °C</div>${outside.excluded.length ? `<div class="outside-note">${this._escape(this._t("excluded", { names: excludedNames }))}</div>` : ""}</div>
        <div class="units">
          ${devices.length > 1 ? `<div class="group">
            <div class="unit-head"><h2 class="unit-title">${this._icon("House")} ${this._t("all")}</h2>
              <details class="unit-menu"><summary aria-label="${this._t("moreAll")}">⋮</summary><div class="menu-items"><button data-control="power" data-target="all">${this._t("powerAll")}</button><button data-light-settings="all">${this._t("light")}</button></div></details>
            </div>
            ${this._controls(devices, true)}
          </div>` : ""}
          ${cards || `<div class="unit">${this._t("empty")}</div>`}
        </div>
      </section>`;

    const guardSelect = (select) => {
      select.addEventListener("pointerdown", () => { this._openManualSelect = select; });
      select.addEventListener("keydown", (event) => {
        if (["Escape", "Tab", "Enter"].includes(event.key)) this._openManualSelect = undefined;
        else if ([" ", "ArrowDown", "ArrowUp"].includes(event.key)) this._openManualSelect = select;
      });
      select.addEventListener("change", () => { this._openManualSelect = undefined; });
      select.addEventListener("focus", () => this._setEditing(true));
      select.addEventListener("blur", () => this._setEditing(false));
    };
    this.querySelectorAll("select").forEach(guardSelect);
    this.querySelectorAll("details").forEach((menu) => menu.addEventListener("toggle", () => this._setEditing(menu.open || !!this.querySelector(".light-popup"))));
    this.querySelectorAll("[data-light-settings]").forEach((button) => button.addEventListener("click", () => this._openLightPopup(button, button.dataset.lightSettings)));
    this.querySelectorAll("[data-color]").forEach((input) => input.addEventListener("change", () => this._handleColor(input)));
    this.querySelectorAll("[data-control]").forEach((button) => {
      if (button.dataset.control === "light") this._bindLightPress(button);
      else button.addEventListener("click", () => this._handleControl(button));
    });
    this.querySelectorAll("[data-manual]").forEach((select) => select.addEventListener("change", () => {
      const devices = select.dataset.manual === "all" ? this._devices() : this._devices().filter((device) => device.id === select.dataset.manual);
      const option = select.value;
      if (devices.some((device) => this._isUpdating(device))) return;
      devices.forEach((device) => this._optimisticCall("select", "select_option", { option }, this._find(device, "_mode", "select"), option, "manual", select.dataset.manual));
    }));
    this.querySelectorAll("[data-notices]").forEach((container) => container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-notice]");
      if (button) { event.stopPropagation(); this._confirmNotice(button); }
    }));
    this._updateControls();
    this.querySelectorAll("[data-device]").forEach((card) => card.addEventListener("click", (event) => {
      if (event.target.closest("button, select, details")) return;
      this._detailDeviceId = card.dataset.device;
      this.render();
    }));
  }

  _renderDetail(device) {
    const metrics = [
      { id: "co2", label: "CO₂", entity: this._find(device, "_co2", "sensor") },
      { id: "temperature", label: this._t("temperature"), entity: this._find(device, "_room_temperature", "sensor") },
      { id: "humidity", label: this._t("humidity"), entity: this._find(device, "_humidity", "sensor") },
      { id: "intensity", label: this._t("power"), entity: this._find(device, "_ventilation_intensity", "sensor") },
    ].filter((metric) => metric.entity);
    const metric = metrics.find((item) => item.id === this._detailMetric) || metrics[0];
    this._detailMetric = metric?.id;
    this.innerHTML = `
      <style>
        :host { display: block; }
        .shell { color: var(--primary-text-color); font-family: var(--primary-font-family); max-width: 1440px; margin: 0 auto; padding: 24px 32px; box-sizing: border-box; }
        .detail { background: var(--card-background-color); border-radius: 28px; padding: 20px; box-shadow: var(--ha-card-box-shadow, none); }
        .back, .metric-button { border: 0; border-radius: 999px; min-height: 44px; padding: 0 16px; background: var(--secondary-background-color); color: var(--primary-text-color); cursor: pointer; font: inherit; }
        .metric-button.active { background: var(--primary-color); color: var(--text-primary-color, white); }
        .metric-controls { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
        h2 { margin: 18px 0 10px; font-size: 1.35rem; }
      </style>
      <section class="shell"><div class="detail"><button class="back" data-back>‹ ${this._t("overview")}</button><h2>${this._escape(device.name)}</h2>
        <div class="metric-controls">${metrics.map((item) => `<button class="metric-button ${item.id === metric?.id ? "active" : ""}" data-metric="${item.id}">${item.label}</button>`).join("")}</div>
        <div data-history></div>
      </div></section>`;
    this.querySelector("[data-back]").addEventListener("click", () => {
      this._detailDeviceId = undefined;
      this._detailMetric = undefined;
      this.render();
    });
    this.querySelectorAll("[data-metric]").forEach((button) => button.addEventListener("click", () => {
      this._detailMetric = button.dataset.metric;
      this.render();
    }));
    if (!metric) return;
    window.loadCardHelpers().then((helpers) => {
      if (this._detailDeviceId !== device.id || this._detailMetric !== metric.id) return;
      const history = helpers.createCardElement({
        type: "history-graph",
        title: this._t("history", { metric: metric.label }),
        hours_to_show: 24,
        entities: [metric.entity],
      });
      history.hass = this._hass;
      this.querySelector("[data-history]")?.append(history);
    }).catch(() => {
      const target = this.querySelector("[data-history]");
      if (target) target.textContent = this._t("historyError");
    });
  }

  _firmwareEntity(device) {
    return this._find(device, "_firmware", "update");
  }

  _isUpdating(device) {
    const entity = this._hass.states[this._firmwareEntity(device)];
    return !!this._firmwareStarting?.has(device.id) || (entity?.state !== "unavailable" && entity?.attributes?.in_progress === true);
  }

  _notificationChips(device) {
    const updateId = this._firmwareEntity(device);
    const update = this._hass.states[updateId];
    const chips = [];
    if (!this._isUpdating(device) && update?.state === "on") {
      chips.push(`<button class="notice-chip" data-notice="firmware" data-unit="${device.id}">${this._escape(this._t("firmwareChip", { version: update.attributes.latest_version }))}</button>`);
    }
    const resetId = this._find(device, "_reset_filter_reminder", "button");
    const filter = this._find(device, "_filter_replacement_needed", "binary_sensor");
    if (this._state(filter, "") === "on" && this._hass.states[resetId] && this._hass.states[resetId].state !== "unavailable" && !this._isUpdating(device)) {
      const messages = this._hass.states[this._find(device, "_warnings", "sensor")]?.attributes?.messages || [];
      const filterMessage = messages.find((message) => /\b(filtry|filters?)\b/i.test(message)) || "";
      const days = filterMessage.match(/(\d+)\s*(?:dn[ůyuí]|dní|days?)/i)?.[1];
      const remaining = this._state(this._find(device, "_filter_status", "sensor"), "");
      const expired = remaining !== "" && Number.isFinite(Number(remaining)) && Number(remaining) <= 0;
      const stopped = this._state(this._find(device, "_power", "binary_sensor"), "") === "off";
      const label = expired ? this._t(stopped ? "filterStopped" : "filterExpired") : days ? this._t("filterDays", { days }) : this._t("filterChip");
      chips.push(`<button class="notice-chip${expired ? " notice-error" : ""}" data-notice="filter" data-unit="${device.id}">${this._escape(label)}</button>`);
    }
    if (update?.attributes?.update_error) chips.push(`<span class="notice-chip">${this._t("updateFailed")}</span>`);
    return chips.join("");
  }

  _confirmNotice(button) {
    const device = this._devices().find((item) => item.id === button.dataset.unit);
    if (!device || this._isUpdating(device)) return;
    const firmware = button.dataset.notice === "firmware";
    const update = this._hass.states[this._firmwareEntity(device)];
    const message = firmware ? this._t("confirmFirmware", { from: update?.attributes?.installed_version || "?", to: update?.attributes?.latest_version || "?" }) : this._t("confirmFilter");
    this._setEditing(true);
    const dialog = document.createElement("dialog");
    dialog.className = "notice-dialog";
    dialog.setAttribute("aria-label", message);
    dialog.innerHTML = `<p>${this._escape(device.name)}</p><p>${this._escape(message)}</p><div><button data-no>${this._t("no")}</button><button data-yes>${this._t("yes")}</button></div>`;
    this.append(dialog);
    const close = () => { dialog.close(); dialog.remove(); this._setEditing(false); };
    dialog.querySelector("[data-no]").addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    dialog.addEventListener("click", (event) => event.stopPropagation());
    dialog.querySelector("[data-yes]").addEventListener("click", async () => {
      close();
      this._commandError = "";
      if (firmware) {
        this._firmwareStarting ||= new Set();
        this._firmwareStarting.add(device.id);
      }
      this._refreshCommands();
      try {
        await this._call(firmware ? "update" : "button", firmware ? "install" : "press", {}, firmware ? this._firmwareEntity(device) : this._find(device, "_reset_filter_reminder", "button"));
      } catch (error) {
        this._commandError = this._t("commandError", { name: device.name });
      } finally {
        this._firmwareStarting?.delete(device.id);
        this._refreshCommands();
      }
    });
    dialog.showModal();
    dialog.querySelector("[data-no]").focus();
  }

  _deviceStatus(device) {
    const modeId = this._find(device, "_mode", "select");
    const reported = this._hass.states[modeId];
    const mode = this._state(modeId, "");
    const power = this._find(device, "_power", "binary_sensor");
    const rawMode = this._state(this._find(device, "_mode", "sensor"), "");
    let key = this._isUpdating(device) ? "statusUpdating" : !reported || ["unknown", "unavailable"].includes(reported.state) ? "statusUnavailable"
      : mode === "off" || (!this._commands?.has(modeId) && this._state(power, "") === "off") ? "statusOff"
      : mode === "holiday" ? "statusHoliday"
      : !this._commands?.has(modeId) && rawMode.includes("/B") ? "statusAutoBypass" : "";
    const warningId = this._find(device, "_warnings", "sensor");
    const warnings = this._hass.states[warningId];
    const messages = Array.isArray(warnings?.attributes?.messages) ? warnings.attributes.messages : [];
    const warning = !["statusUnavailable", "statusUpdating"].includes(key) && Number(warnings?.state) > 0
      ? `⚠ ${messages.length ? messages.join(" · ") : `${this._t("warnings")}: ${warnings.state}`}` : "";
    const text = [key ? this._t(key) : "", warning].filter(Boolean).join(" · ");
    return text ? ` <span class="unit-status${warning || key === "statusUnavailable" ? " status-warning" : ""}">${this._escape(text)}</span>` : "";
  }

  _deviceCard(device) {
    const co2 = this._find(device, "_co2", "sensor");
    const temperature = this._find(device, "_room_temperature", "sensor");
    const humidity = this._find(device, "_humidity", "sensor");
    const intensity = this._find(device, "_ventilation_intensity", "sensor");
    const mode = this._find(device, "_mode", "select");
    const light = this._find(device, "_light", "light");
    const selected = this._state(mode, "");
    return `<article class="unit" data-device="${device.id}">
      <div class="unit-head"><span class="unit-title">${this._deviceIcon(device)} <span data-unit-heading>${this._escape(device.name)}${this._deviceStatus(device)}</span></span>
        <span class="notice-chips" data-notices="${device.id}">${this._notificationChips(device)}</span>
        <details class="unit-menu"><summary aria-label="${this._escape(this._t("moreUnit", { name: device.name }))}">⋮</summary><div class="menu-items">
          <button data-control="power" data-target="${device.id}">${selected === "off" ? this._t("on") : this._t("off")}</button>
          <button data-unit-color data-light-settings="${device.id}" ${selected === "off" ? "hidden" : ""}>${this._t("light")}</button>
          <button data-control="holiday" data-target="${device.id}" ${selected === "off" ? "hidden" : ""}>${this._t(selected === "holiday" ? "holidayOff" : "holidayOn")}</button>
        </div></details>
      </div>
      <div class="metrics">
        <div class="metric"><label>CO₂</label><strong>${this._value(co2, " ppm")}</strong></div>
        <div class="metric"><label>${this._t("temperature")}</label><strong>${this._value(temperature, " °C")}</strong></div>
        <div class="metric"><label>${this._t("humidity")}</label><strong>${this._value(humidity, " %")}</strong></div>
        <div class="metric"><label>${this._t("power")}</label><strong>${this._value(intensity, " %")}</strong></div>
      </div>
      ${this._controls([device])}
    </article>`;
  }
}

if (!customElements.get("recuair-dashboard")) {
  customElements.define("recuair-dashboard", RecuairDashboard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "recuair-dashboard")) window.customCards.push({
  type: "recuair-dashboard",
  name: "RecuAir Dashboard",
  description: "Dynamický přehled a hromadné ovládání jednotek RecuAir DC40.",
});

}

if (customElements.get("home-assistant")) {
  registerRecuairDashboard();
} else {
  customElements.whenDefined("home-assistant").then(registerRecuairDashboard);
}
