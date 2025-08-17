import { hideSectionLoader, showSectionLoader } from "./index.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation";

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
    installP: document.querySelector(".open-app-popup-wrapper .install-pwa"),
    popupTitle: document.querySelector(".open-app-popup-wrapper .popup-title"),
    description: document.querySelector(".open-app-popup-wrapper .description"),
    successBtn: document.querySelector(".open-app-popup-wrapper .success-btn"),
  },
};

// pwa config
import { registerSW } from "virtual:pwa-register";
import { set } from "firebase/database";
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline.");
  },
});
let globalDeferredPrompt = null;
let deferredPrompt = null;

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
export async function handleAppFlow() {
  if (isRunningAsPWA()) {
    return;
  }
  if (!isChrome()) {
    console.log("Not Chrome → show other browser popup");
    await fadeInEffect(DOM.otherBrowserPopup.popup);
    return;
  }

  window.addEventListener("beforeinstallprompt", async (e) => {
    e.preventDefault();
    deferredPrompt = e;
    globalDeferredPrompt = true;
    console.log("Chrome but not installed → show install popup");
    if (DOM.installPopup.popup.style.display !== "none") {
      await fadeOutEffect(DOM.installPopup.popup);
    }
    fadeInEffect(DOM.installPopup.popup);
    hideSectionLoader();
    isInstalling = true;
  });

  // Click handler added only once
  DOM.installPopup.successBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      await fadeOutEffect(DOM.installPopup.popup);
      fadeInEffect(DOM.openAppPopup.popup);
      return;
    }
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
      if (deferredPrompt === null) {
        fadeInEffect(DOM.openAppPopup.popup);
        hideSectionLoader();
        console.log("Running in browser");
      }
    }
  }, 5000);
}
export function isIphone() {
  return /iPhone/i.test(navigator.userAgent);
}

if (window.innerWidth < 1024 && !isIphone()) {
  console.log("executed");

  handleAppFlow();
}

window.addEventListener("appinstalled", () => {
  setTimeout(async () => {
    hideSectionLoader();
    await fadeInEffect(DOM.openAppPopup.popup);
    fadeOutEffect(DOM.installPopup.popup);
    isInstalling = false;
  }, 20000);
});
DOM.openAppPopup.installP.addEventListener("click", async () => {
  showSectionLoader("Loading...");
  setTimeout(async () => {
    if (deferredPrompt) {
      await fadeOutEffect(DOM.openAppPopup.popup);
      hideSectionLoader();
      fadeInEffect(DOM.installPopup.popup);
    } else {
      fadeInEffect(DOM.openAppPopup.popup);
      hideSectionLoader();
      DOM.openAppPopup.installP.textContent = "App already installed";
    }
  }, 2000);
});
