const leaderboarSection = document.querySelector(".leaderboard-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { navIcon, navTitle } from "./navigation.js";
let leaderboardData;
export async function loadLeaderboardSection(inputTestData) {
  testData = inputTestData;
  console.log(testData);
}
export async function showLeaderboardSection() {
  await hideSections();
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/leaderboard.png?updatedAt=1751607436911";
  navTitle.textContent = "Leaderboard";
  fadeInEffect(leaderboarSection);
}
