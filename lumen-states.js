const STATES = {
  welcome:  { label: "WELCOME",  hint: "Enter the operational layer" },
  active:   { label: "ACTIVE",   hint: "Operational layer live" },
  mapping:  { label: "MAPPING",  hint: "Reading the twist" },
  auditing: { label: "AUDITING", hint: "Friction in view — no judgment" },
  complete: { label: "COMPLETE", hint: "Findings ready for the operator" },
  standby:  { label: "STANDBY",  hint: "Terminal in validation" },
  invite:   { label: "INVITE",   hint: "Founder channel open" }
};

const entryGate = document.getElementById("entryGate");
const enterButton = document.getElementById("enterButton");
const chipLabel = document.getElementById("lumenChipLabel");
const chipHint = document.getElementById("lumenChipHint");
const surfaces = Array.from(document.querySelectorAll("section[data-lumen-state]"));

let currentState = "welcome";
let observerStarted = false;
const ratios = new Map();

function setLumenState(name) {
  if (!STATES[name] || name === currentState) return;
  currentState = name;
  document.body.dataset.lumenState = name;
  if (chipLabel) chipLabel.textContent = STATES[name].label;
  if (chipHint) chipHint.textContent = STATES[name].hint;
}

function pickDominant() {
  let best = null;
  let bestScore = 0;
  ratios.forEach((ratio, el) => {
    if (ratio <= 0) return;
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height * 0.28;
    const dist = Math.abs(mid - window.innerHeight * 0.28);
    const score = ratio * 1000 - dist * 0.15;
    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  });
  if (best) setLumenState(best.dataset.lumenState);
}

function startObserver() {
  if (observerStarted || !("IntersectionObserver" in window)) {
    if (!observerStarted) setLumenState("active");
    return;
  }
  observerStarted = true;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    pickDominant();
  }, {
    threshold: [0, 0.15, 0.28, 0.4, 0.55, 0.7, 0.85, 1],
    rootMargin: "-12% 0px -42% 0px"
  });
  surfaces.forEach((el) => io.observe(el));
  setLumenState("active");
}

if (enterButton) {
  enterButton.addEventListener("click", () => {
    if (entryGate) entryGate.classList.add("is-entered");
    document.body.classList.remove("entry-locked");
    startObserver();
  });
}
