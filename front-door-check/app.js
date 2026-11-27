import { onDeviceRead, cloudVerdict } from "./ai.js";
import "./app-check.js";

const form = document.getElementById("frontDoorForm");
const runBtn = document.getElementById("runBtn");
const onDeviceBox = document.getElementById("onDeviceBox");
const onDeviceText = document.getElementById("onDeviceText");
const onDeviceTag = document.getElementById("onDeviceTag");
const cloudBox = document.getElementById("cloudBox");
const cloudStatus = document.getElementById("cloudStatus");
const cloudStep = document.getElementById("cloudStep");
const cloudTag = document.getElementById("cloudTag");
const errorBox = document.getElementById("errorBox");

const STATUSES = ["Firmly Set", "Wobbling", "Sinking", "Gelatina Attack"];

function collectFacts() {
  const fd = new FormData(form);
  const missed = fd.get("missedCalls") || "unknown";
  const listing = fd.get("listingStatus") || "unknown";
  const hours = fd.get("hours") || "unknown";
  const contact = fd.get("firstContact") || "unknown";
  return [
    `Missed calls: ${missed}`,
    `Google listing: ${listing}`,
    `Hours: ${hours}`,
    `First contact: ${contact}`
  ].join("\n");
}

function setLoading(state) {
  runBtn.disabled = state;
  runBtn.textContent = state ? "Lumen Ara is reading..." : "Run the check";
}

function showError(msg) {
  errorBox.hidden = false;
  errorBox.textContent = msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  onDeviceBox.hidden = true;
  cloudBox.hidden = true;
  setLoading(true);

  const facts = collectFacts();
  const tasks = [];

  tasks.push(
    onDeviceRead(facts)
      .then((r) => {
        onDeviceText.textContent = r.text;
        onDeviceTag.textContent = "Source: on-device Gemini Nano";
        onDeviceBox.hidden = false;
      })
      .catch((err) => {
        onDeviceText.textContent = "On-device read unavailable on this device or browser. " + err.message;
        onDeviceTag.textContent = "Source: on-device (failed)";
        onDeviceBox.hidden = false;
      })
  );

  tasks.push(
    cloudVerdict(facts)
      .then((r) => {
        let parsed;
        try { parsed = JSON.parse(r.raw); } catch {
          throw new Error("Cloud returned non-JSON: " + r.raw.slice(0, 200));
        }
        const status = STATUSES.includes(parsed.status) ? parsed.status : "Wobbling";
        cloudStatus.textContent = status;
        cloudStatus.dataset.status = status.replace(/\s+/g, "-").toLowerCase();
        cloudStep.textContent = parsed.nextStep || "No next step returned.";
        cloudTag.textContent = "Source: cloud Gemini via Firebase AI Logic";
        cloudBox.hidden = false;
      })
      .catch((err) => {
        cloudStatus.textContent = "Cloud verdict failed";
        cloudStep.textContent = err.message;
        cloudTag.textContent = "Source: cloud (failed)";
        cloudBox.hidden = false;
      })
  );

  await Promise.all(tasks);
  setLoading(false);
});
