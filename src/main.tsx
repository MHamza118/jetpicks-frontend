import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log(
  "🚀 App starting, Google Client ID:",
  googleClientId ? "Present" : "Missing",
);

// Initialize Facebook SDK only when needed
export function initializeFacebook() {
  console.log("🔄 initializeFacebook called");
  if ((window as any).FB && (window as any).fbSdkLoaded) {
    console.log("✅ Facebook SDK already loaded");
    return Promise.resolve(); // Already initialized
  }

  console.log("📦 Starting Facebook SDK initialization");
  return new Promise<void>((resolve) => {
    if ((window as any).fbAsyncInit) {
      console.log("⏳ Facebook SDK already initializing");
      resolve(); // Already initializing
      return;
    }

    console.log("🔧 Setting up fbAsyncInit");
    (window as any).fbAsyncInit = function () {
      console.log("🎯 fbAsyncInit callback fired");
      if ((window as any).FB) {
        console.log("🚀 Initializing Facebook SDK");
        (window as any).FB.init({
          appId: "2350212092120889",
          xfbml: true,
          version: "v19.0",
        });
        (window as any).fbSdkLoaded = true;
        console.log("✅ Facebook SDK initialized successfully");
        resolve();
      } else {
        console.error("❌ FB object not found in fbAsyncInit");
      }
    };

    // Load the Facebook SDK
    console.log("📥 Loading Facebook SDK script");
    (function (d, s, id) {
      var js: HTMLScriptElement,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        console.log("⚠️ Facebook SDK script already exists");
        resolve();
        return;
      }
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      console.log("📤 Inserting Facebook SDK script into DOM");
      fjs!.parentNode!.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  });
}

// Remove the automatic initialization
// initializeFacebook();

console.log("🎨 Rendering app with Google OAuth Provider");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
