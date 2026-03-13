import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Initialize Facebook SDK only when needed
export function initializeFacebook() {
  if ((window as any).FB && (window as any).fbSdkLoaded) return Promise.resolve(); // Already initialized

  return new Promise<void>((resolve) => {
    if ((window as any).fbAsyncInit) {
      resolve(); // Already initializing
      return;
    }

    (window as any).fbAsyncInit = function () {
      if ((window as any).FB) {
        (window as any).FB.init({
          appId: "2350212092120889",
          xfbml: true,
          version: "v19.0",
        });
        (window as any).fbSdkLoaded = true;
        resolve();
      }
    };

    // Load the Facebook SDK
    (function (d, s, id) {
      var js: HTMLScriptElement,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        resolve();
        return;
      }
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs!.parentNode!.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  });
}

// Remove the automatic initialization
// initializeFacebook();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
