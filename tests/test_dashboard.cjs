// Run against the actual dashboard class, without a browser or unit commands.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ctx = { HTMLElement: class {}, customElements: { get: name => name === "home-assistant", define: (name, cls) => { ctx.Card = cls; ctx.cardType = name; } }, window: {}, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../custom_components/recuair/frontend/recuair-dashboard.js"), "utf8"), ctx);
// A fast extra-module fetch can finish before HA replaces the native registry.
// The card must use the final registry AND the patched HTMLElement constructor.
let frontendReady;
let nativeDefinitions = 0;
const startup = {
  HTMLElement: class NativeElement {},
  customElements: {
    get: () => undefined,
    define: () => { nativeDefinitions++; },
    whenDefined: name => {
      assert.equal(name, "home-assistant");
      return { then: callback => { frontendReady = callback; } };
    },
  },
  window: {}, setTimeout, clearTimeout,
};
vm.createContext(startup);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../custom_components/recuair/frontend/recuair-dashboard.js"), "utf8"), startup);
assert.equal(nativeDefinitions, 0);
assert.equal(startup.Card, undefined);
startup.HTMLElement = class PatchedElement {};
startup.customElements = {
  get: name => name === "home-assistant" ? class HomeAssistant {} : startup.Card,
  define: (name, cls) => { assert.equal(name, "recuair-dashboard"); startup.Card = cls; },
};
frontendReady();
assert.ok(new startup.Card() instanceof startup.HTMLElement);
assert.equal(nativeDefinitions, 0);
const registeredCard = startup.Card;
frontendReady();
assert.equal(startup.Card, registeredCard);
assert.equal(startup.window.customCards.length, 1);
console.log("Dashboard waits for HA's final custom-element registry and HTMLElement.");

const card = new ctx.Card();
assert.equal(ctx.cardType, "recuair-dashboard");
assert.equal(ctx.window.customCards[0].type, "recuair-dashboard");
const entities = [
  { entity_id: "sensor.co2", platform: "recuair", device_id: "room" },
  { entity_id: "light.custom_name_2", platform: "recuair", device_id: "room" },
  { entity_id: "select.renamed", platform: "recuair", device_id: "room" },
  { entity_id: "update.arbitrary", platform: "recuair", device_id: "room" },
  { entity_id: "sensor.fake_light", platform: "recuair", device_id: "room" },
];
card._hass = { language: "en", entities: Object.fromEntries(entities.map(e => [e.entity_id, e])), devices: { room: { name: "Test" } }, states: {
  "sensor.co2": { state: "850", attributes: { recuair_role: "co2" } },
  "light.custom_name_2": { state: "off", attributes: { recuair_role: "light" } },
  "select.renamed": { state: "auto", attributes: { recuair_role: "mode" } },
  "update.arbitrary": { state: "off", attributes: { recuair_role: "firmware" } },
  "sensor.fake_light": { state: "0", attributes: { recuair_role: "light" } },
} };
const device = card._devices()[0];
// Titles follow area assignment and count units, not entities or other devices.
assert.equal(device.name, "Test");
card._hass.devices.room.area_id = "living";
card._hass.areas = { living: { name: "Obývák", icon: "mdi:sofa" } };
card._hass.devices.unrelated = { area_id: "living", name: "Lamp" };
assert.equal(card._devices()[0].name, "Obývák");
assert.equal(card._devices()[0].areaIcon, "mdi:sofa");
card._hass.devices.second = { area_id: "living", name: "Unit 2", name_by_user: "U okna" };
card._hass.entities["sensor.second"] = { entity_id: "sensor.second", platform: "recuair", device_id: "second" };
assert.equal(card._devices()[0].name, "Obývák - Test");
assert.equal(card._devices()[1].name, "Obývák - U okna");
delete card._hass.entities["sensor.second"];
card._hass.devices.room.area_id = "missing";
assert.equal(card._devices()[0].name, "Test");
delete card._hass.devices.room.area_id;
assert.equal(card._find(device, "_co2", "sensor"), "sensor.co2");
assert.equal(card._find(device, "_light", "light"), "light.custom_name_2");
assert.equal(card._find(device, "_mode", "select"), "select.renamed");
assert.equal(card._firmwareEntity(device), "update.arbitrary");
assert.equal(card._find(device, "_humidity", "sensor"), undefined);
const calls = [];
card._optimisticCall = (...args) => calls.push(args);
card._handleControl({ dataset: { target: "all", control: "light" } });
assert.equal(calls[0][3], "light.custom_name_2");
card._handleControl({ dataset: { target: "all", control: "bypass" } });
assert.equal(calls[1][3], "select.renamed");
assert.equal(calls[1][2].option, "bypass");
// Preserve unsafe characters as text in the actual history renderer.
card.querySelector = () => ({ addEventListener() {} });
card.querySelectorAll = () => [];
card._renderDetail({ id: "empty", entities: [], name: '<img src=x onerror="bad()"> & Room' });
assert.ok(card.innerHTML.includes('&lt;img src=x onerror=&quot;bad()&quot;&gt; &amp; Room'));
assert.ok(!card.innerHTML.includes('<img src=x'));
console.log("Dashboard regression checks passed (role lookup, group controls, escaped detail).");

// HA preserves capability roles while removing normal extras during an outage.
for (const entity of Object.values(card._hass.states)) entity.state = "unavailable";
assert.equal(card._find(device, "_co2", "sensor"), "sensor.co2");
assert.equal(card._find(device, "_light", "light"), "light.custom_name_2");
console.log("Unavailable entities retain role lookup for history and controls.");

card.querySelector = () => null;
card.render();
assert.ok(!card.innerHTML.includes('<div class="group">'));
card._hass.entities["sensor.second"] = { entity_id: "sensor.second", platform: "recuair", device_id: "second" };
card.render();
assert.ok(card.innerHTML.includes('<div class="group">'));
card._hass.entities = {};
card.render();
assert.ok(!card.innerHTML.includes('<div class="group">'));
console.log("Card registration and group visibility for zero, one and multiple units verified.");

// Apply input events immediately, coalesce rapid selections while writing,
// and preserve the final selection after blur/close without a Set button.
const lightCard = new ctx.Card();
lightCard._hass = { ...card._hass, entities: Object.fromEntries(entities.map(e => [e.entity_id, e])), states: {
  ...card._hass.states,
  "light.custom_name_2": { state: "on", attributes: { recuair_role: "light", brightness: 153, rgb_color: [0, 0, 255] } },
  "update.arbitrary": { state: "off", attributes: { recuair_role: "firmware" } },
} };
const node = (extras = {}) => ({ listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, ...extras });
const color = node({ value: "#0000ff", dataset: { color: "room" } });
const range = node({ value: "3" });
const output = node({ textContent: "3" });
const close = node({ focus() {} });
const parts = { "[data-color]": color, 'input[type="range"]': range, "output": output, "[data-light-close]": close };
const popup = node({ dataset: {}, style: {}, offsetWidth: 280, offsetHeight: 220, setAttribute() {}, querySelector: key => parts[key] });
ctx.document = { createElement: () => popup };
ctx.window.innerWidth = 1200; ctx.window.innerHeight = 900;
lightCard.querySelectorAll = () => [];
lightCard.querySelector = () => null;
lightCard.append = () => { lightCard.querySelector = key => key === ".light-popup" ? popup : null; };
const colorCalls = [];
let finishFirst;
lightCard._optimisticCall = (...args) => {
  colorCalls.push(args);
  return colorCalls.length === 1 ? new Promise(resolve => { finishFirst = resolve; }) : Promise.resolve();
};
lightCard._openLightPopup({ getBoundingClientRect: () => ({ right: 600, top: 400 }) }, "room");
assert.ok(!popup.innerHTML.includes("data-apply-color"));
color.listeners.focus();
color.value = "#ff0000";
color.listeners.input();
assert.deepEqual(Array.from(colorCalls[0][2].rgb_color), [255, 0, 0], "First input is sent before picker closes");
color.value = "#00ff00";
color.listeners.input();
color.value = "#ffffff";
color.listeners.input();
color.listeners.change(); // Duplicate commit event must not send twice.
color.listeners.blur();
lightCard._updateLightPopup();
assert.equal(color.value, "#ffffff", "Poll must not overwrite the latest pending preview");
assert.equal(colorCalls.length, 1);
const pendingPreview = lightCard._colorPreviews.get("room").promise;
popup.remove = () => { lightCard.querySelector = () => null; };
lightCard._closeLightPopup();
finishFirst();
pendingPreview.then(() => {
  assert.equal(colorCalls.length, 2, "Only the latest pending color is sent after the in-flight write");
  assert.deepEqual(Array.from(colorCalls[1][2].rgb_color), [255, 255, 255]);
  assert.equal(colorCalls[1][3], "light.custom_name_2");
  assert.equal(lightCard._colorPreviews.size, 0);
  range.value = "4";
  range.listeners.change();
  assert.equal(colorCalls[2][2].brightness, 204);
  assert.equal(colorCalls[2][2].rgb_color, undefined, "Brightness must not resend a stale color");
  console.log("Live color preview applies before close, coalesces drags, preserves the final choice and leaves brightness independent.");
}).catch(error => { console.error(error); process.exitCode = 1; });

// A transient render exception must not escape into HA's permanent generic
// error card. Surface the reason safely and recover on the next state update.
const recoveryCard = new ctx.Card();
const errors = [];
ctx.console = { error: (...args) => errors.push(args) };
let retry;
recoveryCard.querySelector = () => ({ addEventListener: (_, fn) => { retry = fn; } });
recoveryCard.render = () => { throw new Error('<temporary startup error>'); };
recoveryCard._editing = true;
recoveryCard._updateControls = recoveryCard.render;
assert.doesNotThrow(() => { recoveryCard.hass = { states: {}, language: "en" }; });
assert.ok(recoveryCard.innerHTML.includes('&lt;temporary startup error&gt;'));
assert.equal(errors.length, 1);
assert.equal(recoveryCard._editing, false);
recoveryCard.render = () => { recoveryCard.innerHTML = 'recovered'; };
retry();
assert.equal(recoveryCard.innerHTML, 'recovered');
recoveryCard.render = () => { throw new Error('second transient error'); };
recoveryCard.hass = { states: {}, language: "en" };
recoveryCard.render = () => { recoveryCard.innerHTML = 'automatic recovery'; };
recoveryCard.hass = { states: {}, language: "en" };
assert.equal(recoveryCard.innerHTML, 'automatic recovery');
console.log("Render failures retain diagnostic text and recover on retry or the next HA update.");

// Pending previews must not overtake newer light commands, including commands
// issued from a different (all-units vs room) control surface.
(async () => {
  const makeQueuedCard = () => {
    const queued = new ctx.Card();
    queued._hass = {
      language: "en", devices: {}, entities: {
        first: { entity_id: "light.first", platform: "recuair", device_id: "first" },
        second: { entity_id: "light.second", platform: "recuair", device_id: "second" },
      }, states: {
        "light.first": { state: "on", attributes: { recuair_role: "light", rgb_color: [0, 0, 255] } },
        "light.second": { state: "on", attributes: { recuair_role: "light", rgb_color: [0, 0, 255] } },
      },
    };
    queued._refreshCommands = () => {};
    const sent = [];
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    queued._call = async (domain, service, data, id) => {
      sent.push({ service, data, id });
      if (data.rgb_color?.[0] === 255) await gate;
    };
    return { queued, sent, release, cleanup: () => {
      for (const command of queued._commands?.values() || []) clearTimeout(command.timer);
    } };
  };
  const preview = (queued, target, value) => queued._previewColor({ value, dataset: { color: target } });
  // Room preview followed by all-units off: the final state must stay off.
  {
    const { queued, sent, release, cleanup } = makeQueuedCard();
    const pending = preview(queued, "first", "#ff0000");
    preview(queued, "first", "#00ff00");
    queued._handleControl({ dataset: { target: "all", control: "light" } });
    const writes = [...queued._commandQueues.values()];
    release();
    await Promise.all([pending, ...writes]);
    assert.deepEqual(sent.filter(x => x.id === "light.first").map(x => x.service), ["turn_on", "turn_off"]);
    assert.ok(!sent.some(x => x.data.rgb_color?.[1] === 255));
    cleanup();
  }
  // All-units preview followed by room off: retain the preview for the other unit.
  {
    const { queued, sent, release, cleanup } = makeQueuedCard();
    const pending = preview(queued, "all", "#ff0000");
    preview(queued, "all", "#00ff00");
    queued._handleControl({ dataset: { target: "first", control: "light" } });
    const writes = [...queued._commandQueues.values()];
    release();
    await Promise.all([pending, ...writes]);
    assert.deepEqual(sent.filter(x => x.id === "light.first").map(x => x.service), ["turn_on", "turn_off"]);
    assert.deepEqual(Array.from(sent.filter(x => x.id === "light.second").at(-1).data.rgb_color), [0, 255, 0]);
    cleanup();
  }
  // Brightness changes must preserve the latest coalesced color selection.
  {
    const { queued, sent, release, cleanup } = makeQueuedCard();
    const pending = preview(queued, "first", "#ff0000");
    preview(queued, "first", "#00ff00");
    const brightness = queued._optimisticCall("light", "turn_on", { brightness: 204 }, "light.first", "on");
    release();
    await Promise.all([pending, brightness]);
    const writes = sent.filter(x => x.id === "light.first");
    assert.ok(writes.some(x => x.data.brightness === 204));
    assert.deepEqual(Array.from(writes.at(-1).data.rgb_color), [0, 255, 0]);
    assert.equal(writes.at(-1).data.brightness, undefined);
    cleanup();
  }
  // A later room color must win over an older coalesced all-units color.
  {
    const { queued, sent, release, cleanup } = makeQueuedCard();
    const group = preview(queued, "all", "#ff0000");
    preview(queued, "all", "#00ff00");
    const room = preview(queued, "first", "#0000ff");
    release();
    await Promise.all([group, room]);
    assert.deepEqual(Array.from(sent.filter(x => x.id === "light.first").at(-1).data.rgb_color), [0, 0, 255]);
    assert.deepEqual(Array.from(sent.filter(x => x.id === "light.second").at(-1).data.rgb_color), [0, 255, 0]);
    cleanup();
  }
  // After a failed write/external change restores blue, selecting white again
  // must send a new write; its paired change event must still be deduplicated.
  await pendingPreview;
  lightCard.querySelector = key => key === ".light-popup" ? popup : null;
  lightCard._lightColorEditing = false;
  lightCard._updateLightPopup();
  assert.equal(color.value, "#0000ff");
  const beforeRetry = colorCalls.length;
  color.listeners.focus();
  color.value = "#ffffff";
  color.listeners.input();
  color.listeners.change();
  assert.equal(colorCalls.length, beforeRetry + 1);
  await lightCard._colorPreviews.get("room").promise;
  color.listeners.blur();
  lightCard._updateLightPopup();
  const beforeExternalRetry = colorCalls.length;
  color.value = "#ffffff";
  color.listeners.change();
  assert.equal(colorCalls.length, beforeExternalRetry + 1);
  await lightCard._colorPreviews.get("room").promise;
  // A partial group failure leaves mixed reported colors. Reapplying the same
  // visible color must retry both units rather than retain a stale dedup marker.
  lightCard._hass.entities.second = { entity_id: "light.second", platform: "recuair", device_id: "second" };
  lightCard._hass.states["light.second"] = { state: "on", attributes: { recuair_role: "light", brightness: 153, rgb_color: [255, 255, 255] } };
  popup.dataset.lightTarget = color.dataset.color = "all";
  popup.dataset.selectedColor = color.value = "#ffffff";
  lightCard._lightColorEditing = false;
  lightCard._updateLightPopup();
  assert.equal(popup.dataset.selectedColor, undefined);
  const beforeGroupRetry = colorCalls.length;
  color.listeners.change();
  color.listeners.change();
  assert.equal(colorCalls.length, beforeGroupRetry + 2);
  await lightCard._colorPreviews.get("all").promise;
  console.log("Color ordering across room/group commands and retries after reported-state changes verified.");
})().catch(error => { console.error(error); process.exitCode = 1; });
