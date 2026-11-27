# AraNet Front Door Check

A hybrid AI read of a small business's front door. The owner types four front-door facts — missed calls in the last 72 hours, Google Business listing status, posted hours, and how first contact happens today. Gemini Nano on-device and Cloud Gemini 4 Hydrogen read in parallel — Nano privately on-device, the cloud giving the full verdict in the four Jello Mundo statuses (Firmly Set, Wobbling, Sinking, Gelatina Attack) plus one next step. Lumen Ara is the face.

Built for #BuildHybridAI. All inference runs through Firebase AI Logic. Text only, free tier.

## Run it

Live: https://aranet-hybrid.web.app

Local:

```
npm install -g firebase-tools
firebase login
firebase serve --only hosting
```

Then open http://localhost:5000

Deploy:

```
firebase deploy --only hosting
```

## Chrome setup for the on-device read

Desktop Chrome v139 or newer:

1. Open `chrome://flags/#prompt-api` and set it to Enabled. Relaunch Chrome.
2. Let Gemini Nano download — first use prompts the download (check `chrome://components` → Optimization Guide On Device Model).

If Nano isn't available on the machine, the page says so plainly and the cloud verdict still runs.

## Project

Firebase project: `aranet-hybrid`. AI Logic with the Gemini Developer API. App Check with reCAPTCHA Enterprise (Fraud Defense). No API keys or debug tokens are committed.

License: Apache 2.0 (see LICENSE in the repo root).
