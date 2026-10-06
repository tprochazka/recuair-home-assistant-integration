class RecuairDashboard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    // A history card reloads its complete data series when it is recreated.
    // Keep an open detail stable; it is refreshed when the user returns to the overview.
    if (this._detailDeviceId) return;
    if (this._editing) {
      this._renderPending = true;
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
    return [...groups.entries()].map(([id, entities]) => ({
      id,
      entities,
      name: this._hass.devices?.[id]?.name_by_user || this._hass.devices?.[id]?.name || "Rekuperace",
    }));
  }

  _find(device, suffix, domain) {
    return device.entities.find((entity) =>
      entity.entity_id.endsWith(suffix) && (!domain || entity.entity_id.startsWith(`${domain}.`)),
    )?.entity_id;
  }

  _state(entityId, fallback = "–") {
    const state = this._hass.states[entityId];
    if (!state || ["unknown", "unavailable"].includes(state.state)) return fallback;
    return state.state;
  }

  _value(entityId, suffix = "") {
    const value = this._state(entityId);
    return value === "–" ? value : `${value}${suffix}`;
  }

  _call(domain, service, data, target) {
    this._hass.callService(domain, service, data, target ? { entity_id: target } : undefined);
  }

  _setAllMode(option) {
    const targets = this._devices().map((device) => this._find(device, "_mode", "select")).filter(Boolean);
    // Send the command to every unit separately. This also works with older
    // Home Assistant service-target handling that accepts only one entity.
    for (const target of targets) this._call("select", "select_option", { option }, target);
  }

  _options(entityId) {
    const available = this._hass.states[entityId]?.attributes?.options || [];
    const preferredOrder = ["auto", "1", "2", "3", "4", "holiday", "bypass", "off"];
    return preferredOrder.filter((option) => available.includes(option));
  }

  _toggleAllLights() {
    const targets = this._devices().map((device) => this._find(device, "_light", "light")).filter(Boolean);
    const allOn = targets.length > 0 && targets.every((target) => this._state(target) === "on");
    for (const target of targets) this._call("light", allOn ? "turn_off" : "turn_on", {}, target);
  }

  _setEditing(editing) {
    this._editing = editing;
    if (!editing && this._renderPending) {
      this._renderPending = false;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._hass) return;
    const devices = this._devices();
    const outside = devices
      .map((device) => Number.parseFloat(this._state(this._find(device, "_outside_temperature", "sensor"), "NaN")))
      .filter(Number.isFinite);
    const average = outside.length ? (outside.reduce((sum, value) => sum + value, 0) / outside.length).toFixed(1) : "–";
    const detailDevice = devices.find((device) => device.id === this._detailDeviceId);
    if (detailDevice) {
      this._renderDetail(detailDevice);
      return;
    }
    const cards = devices.map((device) => this._deviceCard(device)).join("");
    const modeEntities = devices.map((device) => this._find(device, "_mode", "select")).filter(Boolean);
    const modes = modeEntities.map((entityId) => this._state(entityId, "")).filter(Boolean);
    const sharedMode = modes.length === modeEntities.length && modes.every((mode) => mode === modes[0]) ? modes[0] : "";
    const options = [...new Set(modeEntities.flatMap((entityId) => this._options(entityId)))];
    const lightEntities = devices.map((device) => this._find(device, "_light", "light")).filter(Boolean);
    const allLightsOn = lightEntities.length > 0 && lightEntities.every((entityId) => this._state(entityId) === "on");

    this.innerHTML = `
      <style>
        :host { display: block; }
        .shell { color: var(--primary-text-color); font-family: var(--primary-font-family); max-width: 1440px; margin: 0 auto; padding: 24px 32px; box-sizing: border-box; }
        .outside, .group, .unit { background: var(--card-background-color); border-radius: 28px; padding: 20px; box-shadow: var(--ha-card-box-shadow, none); }
        .group { display: flex; flex-direction: column; }
        .outside { margin: 14px 0; }
        .units { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 14px 0; }
        .outside { text-align: center; background: color-mix(in srgb, var(--primary-color) 20%, var(--card-background-color)); }
        .eyebrow { color: var(--primary-color); font-size: 1rem; margin-bottom: 6px; }
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
        .warning { margin-top: 12px; color: var(--warning-color); }
        @media (max-width: 650px) { .shell { padding: 12px; } .units { grid-template-columns: 1fr; } }
        @media (max-width: 500px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      </style>
      <section class="shell">
        <div class="outside"><div class="eyebrow">VENKU · PRŮMĚR</div><div class="temperature">${average} °C</div></div>
        <div class="units">
          <div class="group">
            <h2>⌂ VŠECHNY JEDNOTKY</h2>
            <div class="controls">
              <button data-all-light class="${allLightsOn ? "primary" : ""}" aria-label="Přepnout světla všech jednotek">💡</button>
              <select data-all-mode aria-label="Režim všech jednotek">
                <option value="" ${sharedMode ? "" : "selected"} disabled hidden></option>
                ${options.map((option) => `<option value="${option}" ${option === sharedMode ? "selected" : ""}>${option}</option>`).join("")}
              </select>
            </div>
          </div>
          ${cards || "<div class=\"unit\">Nebyla nalezena žádná RecuAir DC40.</div>"}
        </div>
      </section>`;

    const guardSelect = (select) => {
      select.addEventListener("focus", () => this._setEditing(true));
      select.addEventListener("blur", () => this._setEditing(false));
    };
    this.querySelectorAll("select").forEach(guardSelect);
    this.querySelector("[data-all-mode]")?.addEventListener("change", (event) => {
      if (event.target.value) this._setAllMode(event.target.value);
    });
    this.querySelector("[data-all-light]")?.addEventListener("click", () => this._toggleAllLights());
    this.querySelectorAll("[data-mode]").forEach((select) => select.addEventListener("change", () => this._call("select", "select_option", { option: select.value }, select.dataset.mode)));
    this.querySelectorAll("[data-light]").forEach((button) => button.addEventListener("click", () => this._call("light", "toggle", {}, button.dataset.light)));
    this.querySelectorAll("[data-device]").forEach((card) => card.addEventListener("click", (event) => {
      if (event.target.closest("button, select")) return;
      this._detailDeviceId = card.dataset.device;
      this.render();
    }));
  }

  _renderDetail(device) {
    const metrics = [
      { id: "co2", label: "CO₂", entity: this._find(device, "_co2", "sensor") },
      { id: "temperature", label: "Teplota", entity: this._find(device, "_room_temperature", "sensor") },
      { id: "humidity", label: "Vlhkost", entity: this._find(device, "_humidity", "sensor") },
      { id: "intensity", label: "Výkon", entity: this._find(device, "_ventilation_intensity", "sensor") },
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
      <section class="shell"><div class="detail"><button class="back" data-back>‹ Přehled</button><h2>${device.name}</h2>
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
        title: `${metric.label} za 24 hodin`,
        hours_to_show: 24,
        entities: [metric.entity],
      });
      history.hass = this._hass;
      this.querySelector("[data-history]")?.append(history);
    }).catch(() => {
      const target = this.querySelector("[data-history]");
      if (target) target.textContent = "Graf historie se nepodařilo načíst.";
    });
  }

  _deviceCard(device) {
    const co2 = this._find(device, "_co2", "sensor");
    const temperature = this._find(device, "_room_temperature", "sensor");
    const humidity = this._find(device, "_humidity", "sensor");
    const intensity = this._find(device, "_ventilation_intensity", "sensor");
    const mode = this._find(device, "_mode", "select");
    const light = this._find(device, "_light", "light");
    const warnings = this._find(device, "_warnings", "sensor");
    const warningCount = this._state(warnings, "0");
    const options = this._options(mode);
    const selected = this._state(mode, "");
    return `<article class="unit" data-device="${device.id}">
      <div class="unit-head"><span class="unit-title">▣ ${device.name}</span><span>${this._state(mode)}</span></div>
      <div class="metrics">
        <div class="metric"><label>CO₂</label><strong>${this._value(co2, " ppm")}</strong></div>
        <div class="metric"><label>Teplota</label><strong>${this._value(temperature, " °C")}</strong></div>
        <div class="metric"><label>Vlhkost</label><strong>${this._value(humidity, " %")}</strong></div>
        <div class="metric"><label>Výkon</label><strong>${this._value(intensity, " %")}</strong></div>
      </div>
      <div class="controls">
        <button data-light="${light}">💡</button>
        <select data-mode="${mode}" aria-label="Režim ${device.name}">${options.map((option) => `<option value="${option}" ${option === selected ? "selected" : ""}>${option}</option>`).join("")}</select>
      </div>
      ${warningCount !== "0" ? `<div class="warning">⚠ Upozornění: ${warningCount}</div>` : ""}
    </article>`;
  }
}

if (!customElements.get("recuair-dashboard-v2")) {
  customElements.define("recuair-dashboard-v2", RecuairDashboard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "recuair-dashboard-v2",
  name: "RecuAir Dashboard",
  description: "Dynamický přehled a hromadné ovládání jednotek RecuAir DC40.",
});
