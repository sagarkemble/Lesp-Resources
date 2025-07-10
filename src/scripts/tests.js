const testsSection = document.querySelector(".tests-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { navIcon, navTitle } from "./navigation.js";
let testData;
export async function loadTestSection(inputTestData) {
  testData = inputTestData;
  console.log(testData);
}
export async function showTestsSection() {
  await hideSections();
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/test.png?updatedAt=1751607386764";
  navTitle.textContent = "Tests";
  fadeInEffect(testsSection);
}
