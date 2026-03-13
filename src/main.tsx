import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Initialize Facebook SDK
function initializeFacebook() {
  if (window.fbAsyncInit) return; // Already initialized

  window.fbAsyncInit = function () {
    if (window.FB) {
      window.FB.init({
        appId: "2350212092120889",
        xfbml: true,
        version: "v19.0",
      });
    }
  };

  // Load the Facebook SDK
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs!.parentNode!.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
}

// Initialize Facebook on app load
initializeFacebook();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
