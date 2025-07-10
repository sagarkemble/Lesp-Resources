const sessionsSection = document.querySelector(".sessions-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { navIcon, navTitle } from "./navigation.js";
let testData;
export async function loadSessionsSection(inputTestData) {
  testData = inputTestData;
  console.log(testData);
}
export async function showSessionsSection() {
  await hideSections();
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/image.png?updatedAt=1751906213435";
  navTitle.textContent = "Sessions";
  fadeInEffect(sessionsSection);
}
