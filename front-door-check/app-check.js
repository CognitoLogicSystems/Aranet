import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-check.js";
import { app } from "./firebase-app.js";

// reCAPTCHA Enterprise site key from Firebase Console -> App Check -> Register app.
// The site key is public by design (it runs in the browser). Never commit
// a debug token or secret key.
const SITE_KEY = "6LevHzUuAAAAAJzvW55ksp-Z5P51SETTnRveYUn2";

let appCheck = null;
if (SITE_KEY !== "YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY") {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

export { appCheck };
