import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-check.js";
import { app } from "./ai.js";

// ReCaptcha v3 site key from Firebase Console -> App Check -> Register app.
// The site key is public by design (it runs in the browser). Never commit
// a debug token or secret key.
const SITE_KEY = "6LdlFzUuAAAAAIJK6JpusXROzCPs4IJAhDNKPCzM";

let appCheck = null;
if (SITE_KEY !== "YOUR_RECAPTCHA_V3_SITE_KEY") {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

export { appCheck };
