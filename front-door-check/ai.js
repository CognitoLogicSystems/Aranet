import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-ai.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });

const FRONT_DOOR_SYSTEM = `You are Lumen Ara, the interface intelligence of Kitchen Algorithm Labs.
You read a shop's front door: missed calls, Google listing, hours, first-contact path.
Give one short private paragraph. No tools, no links, no markdown. Plain text only.`;

const VERDICT_SYSTEM = `You are Lumen Ara. Given front-door facts, return ONLY valid JSON:
{"status":"Firmly Set"|"Wobbling"|"Sinking"|"Gelatina Attack","nextStep":"one concrete action"}.
No markdown, no explanation outside the JSON.`;

export function buildOnDeviceModel() {
  return getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_ON_DEVICE,
    onDeviceParams: {
      createOptions: {
        temperature: 0.4,
        topK: 8,
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          { role: "system", content: FRONT_DOOR_SYSTEM }
        ]
      }
    }
  });
}

export function buildCloudModel() {
  return getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: {
      model: "gemini-4-hydrogen",
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
    },
    systemInstruction: VERDICT_SYSTEM
  });
}

export async function onDeviceRead(facts) {
  const model = buildOnDeviceModel();
  await ai.initializeDeviceModel?.();
  const result = await model.generateContent(facts);
  return {
    text: result.response.text(),
    source: result.response.inferenceSource || "ON_DEVICE"
  };
}

export async function cloudVerdict(facts) {
  const model = buildCloudModel();
  const result = await model.generateContent(facts);
  return {
    raw: result.response.text(),
    source: result.response.inferenceSource || "IN_CLOUD"
  };
}
