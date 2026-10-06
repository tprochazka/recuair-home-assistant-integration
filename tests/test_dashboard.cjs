// Run against the actual dashboard class, without a browser or unit commands.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ctx = { HTMLElement: class {}, customElements: { get: () => false, define: (name, cls) => { ctx.Card = cls; } }, window: {}, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../custom_components/recuair/frontend/recuair-dashboard.js"), "utf8"), ctx);
const card = new ctx.Card();
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
