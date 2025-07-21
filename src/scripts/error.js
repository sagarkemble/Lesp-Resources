import { fadeInEffect, fadeOutEffect } from "./animation";
import { hideSections, hideSectionLoader } from "./index";
const errorSection = document.querySelector(".error-section");
export async function showErrorSection() {
  await hideSections(false, false, false, false);
  await hideSectionLoader();
  await fadeInEffect(errorSection);
}
