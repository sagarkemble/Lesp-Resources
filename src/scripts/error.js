import { fadeInEffect, fadeOutEffect } from "./animation";
import { hideSections, hideSectionLoader, lottieLoadingScreen } from "./index";
const DOM = {
  offline: {
    section: document.querySelector(".offline-section"),
    img: new Image(),
  },
};
const errorSection = document.querySelector(".error-section");
import * as Sentry from "@sentry/browser";
Sentry.init({
  dsn: "https://f123aee0ee34252e12f97d64f9127ba3@o4509854772297728.ingest.us.sentry.io/4509854774394880",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
export async function showErrorSection(errorMsg, error) {
  await hideSections(false, false, false, false);
  await hideSectionLoader();
  await fadeOutEffect(lottieLoadingScreen);
  await fadeInEffect(errorSection);
  Sentry.captureException(error);
  console.error(errorMsg, error);
}
export async function isOffline() {
  if (!navigator.onLine) {
    fadeInEffect(DOM.offline.section);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    window.location.reload();
    return;
  } else {
    fadeOutEffect(DOM.offline.section);
    return;
  }
}
DOM.offline.img.src = "/error-images/offline.png";
