import { hideSectionLoader, showSectionLoader } from "./index.js";
import { fadeInEffect, fadeOutEffect, hideElement } from "./animation";

const DOM = {
  otherBrowserPopup: {
    popup: document.querySelector(".other-browser-popup-wrapper"),
  },
  installPopup: {
    popup: document.querySelector(".install-pwa-popup-wrapper"),
    popupTitle: document.querySelector(
      ".install-pwa-popup-wrapper .popup-title",
    ),
    description: document.querySelector(
      ".install-pwa-popup-wrapper .description",
    ),
    successBtn: document.querySelector(
      ".install-pwa-popup-wrapper .success-btn",
    ),
  },
  openAppPopup: {
    popup: document.querySelector(".open-app-popup-wrapper"),
    popupTitle: document.querySelector(".open-app-popup-wrapper .popup-title"),
    description: document.querySelector(".open-app-popup-wrapper .description"),
    successBtn: document.querySelector(".open-app-popup-wrapper .success-btn"),
  },
};

// pwa config
import { registerSW } from "virtual:pwa-register";
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline.");
  },
});
let deferredPrompt;
let isInstalling = false;
function isChrome() {
  const ua = navigator.userAgent;
  const uaData = navigator.userAgentData;
  if (uaData && uaData.brands) {
    return uaData.brands.some((b) => b.brand.includes("Chrome"));
  }
  return /Chrome/.test(ua) && !/Edg|OPR|Brave/.test(ua);
}

function isRunningAsPWA() {
  return window.matchMedia("(display-mode: standalone)").matches;
}
function handleAppFlow() {
  if (isRunningAsPWA()) {
    console.log("Running as PWA");
    return;
  }

  if (!isChrome()) {
    console.log("Not Chrome → show other browser popup");
    setTimeout(() => fadeInEffect(DOM.otherBrowserPopup.popup), 500);
    return;
  }

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("Chrome but not installed → show install popup");
    fadeInEffect(DOM.installPopup.popup);
    isInstalling = true;
  });

  // Click handler added only once
  DOM.installPopup.successBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    showSectionLoader("Installing App...");
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("PWA installation accepted");
      showSectionLoader("Installing App...");
    } else {
      console.log("PWA installation rejected");
      hideSectionLoader();
    }
    deferredPrompt = null;
  });

  setTimeout(() => {
    if (isRunningAsPWA()) {
      console.log("Running as PWA");
    } else {
      if (!isInstalling) {
        fadeInEffect(DOM.openAppPopup.popup);
        console.log("Running in browser");
      }
    }
  }, 3000);
}

handleAppFlow();
window.addEventListener("appinstalled", () => {
  setTimeout(() => {
    hideSectionLoader();
    fadeInEffect(DOM.openAppPopup.popup);
    fadeOutEffect(DOM.installPopup.popup);
  }, 20000);
});
