const leaderboarSection = document.querySelector(".leaderboard-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { get, ref, db, updateData } from "./firebase.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { appState, syncDbData } from "./appstate.js";
let sortedRollNoWiseStudentData;
let rawStudentData;
let rankWiseSortedData;
export async function loadLeaderboardSection() {
  await unloadSubjectSection();
  await getAllStudentsData();
  rankWiseSortedData = calculateRank();
  initLeaderBoardTopper();
  renderLeaderboardCards(rankWiseSortedData);
  initStats(rankWiseSortedData);
  initPreviousTestWinner();
  renderStudentCardInPopup();
  firstRankSwiper.update();
  secondRankSwiper.update();
  thirdRankSwiper.update();
  firstRankSwiper.autoplay.start();
  secondRankSwiper.autoplay.start();
  thirdRankSwiper.autoplay.start();
}
async function unloadSubjectSection() {
  await fadeOutEffect(leaderboarSection);
  leaderboardStudetCardContainer.innerHTML = "";
  leaderboardCardContainer.innerHTML = "";
}
export async function showLeaderboardSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/leaderboard.png?updatedAt=1751607436911";
  headerTitle.textContent = "Leaderboard";
  await hideSections();
  fadeInEffect(leaderboarSection);
}
const leaderboardCardContainer = document.querySelector(
  ".leaderboard-card-container"
);
const previousTestRankContainer = document.querySelector(
  ".previous-test-rank-container"
);
// First Place
const previousFirstContainer =
  previousTestRankContainer.querySelector(".first");
const previousFirstName = previousTestRankContainer.querySelector(
  ".first .winner-name"
);
const previousFirstPfp = previousTestRankContainer.querySelector(".first .pfp");
const previousFirstMedal =
  previousTestRankContainer.querySelector(".first .medal");
const previousFirstMedalText =
  previousTestRankContainer.querySelector(".first .rank-text");
const previousFirstPoint =
  previousTestRankContainer.querySelector(".first .points");
// Second Place
const previousSecondContainer =
  previousTestRankContainer.querySelector(".second");
const previousSecondName = previousTestRankContainer.querySelector(
  ".second .winner-name"
);
const previousSecondPfp =
  previousTestRankContainer.querySelector(".second .pfp");
const previousSecondMedal =
  previousTestRankContainer.querySelector(".second .medal");
const previousSecondMedalText =
  previousTestRankContainer.querySelector(".second .rank-text");
const previousSecondPoint =
  previousTestRankContainer.querySelector(".second .points");
// Third Place
const previousThirdContainer =
  previousTestRankContainer.querySelector(".third");
const previousThirdName = previousTestRankContainer.querySelector(
  ".third .winner-name"
);
const previousThirdPfp = previousTestRankContainer.querySelector(".third .pfp");
const previousThirdMedal =
  previousTestRankContainer.querySelector(".third .medal");
const previousThirdMedalText =
  previousTestRankContainer.querySelector(".third .rank-text");
const previousThirdPoint =
  previousTestRankContainer.querySelector(".third .points");

const firstRankSwiper = new Swiper("#first-place-swiper", {
  direction: "horizontal",
  loop: true,
  speed: 250,
  effect: "fade",
  autoplay: {
    delay: 2000,
  },
  fadeEffect: {
    crossFade: true,
  },
});
const secondRankSwiper = new Swiper("#second-place-swiper", {
  direction: "horizontal",
  loop: true,
  speed: 250,
  effect: "fade",
  autoplay: {
    delay: 2000,
  },
  fadeEffect: {
    crossFade: true,
  },
});
const thirdRankSwiper = new Swiper("#third-place-swiper", {
  direction: "horizontal",
  loop: true,
  speed: 250,
  effect: "fade",
  autoplay: {
    delay: 2000,
  },
  fadeEffect: {
    crossFade: true,
  },
});
function renderLeaderboardCards(rankWiseSortedData) {
  let previousPts = null;
  let rank = 0;

  rankWiseSortedData.forEach((student, index) => {
    const gold = student.medals?.gold || 0;
    const silver = student.medals?.silver || 0;
    const bronz = student.medals?.bronz || 0;
    const firstName = student.firstName || "";
    const lastName = student.lastName || "";
    if (previousPts !== student.points) {
      rank++;
    }
    if (student.points === 0) {
      rank = "--";
    }
    previousPts = student.points;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 px-3 py-4 md:px-4 flex justify-between rounded-lg";

    card.innerHTML = `
      <div class="name-pfp-rank-wrapper w-[180px] md:w-[340px] gap-1.5 md:gap-4 flex items-center">
<p class="rank ${
      rank === "--" ? "text-sm" : "md:text-xl"
    } w-[21px] md-[26px] text-center">${rank}</p>
        <div class="name-pfp-wrapper flex items-center gap-1 md:gap-2">
          <img
            src="${student.pfp}"
            alt=""
            class="pfp h-10 w-10"
          />
         <div class="flex flex-col leading-tight md:gap-1.5 text-sm md:text-base md:flex-row md:flex-wrap">
  <p class="w-full md:w-auto">${firstName}</p>
  <p class="w-full md:w-auto">${lastName}</p>
</div>

        </div>
      </div>
      <div class="medals-wrapper flex gap-3 md:gap-8">
        <div class="medal flex flex-col md:flex-row md:gap-2 items-center">
          <img
            src="https://ik.imagekit.io/yn9gz2n2g/others/gold.png?updatedAt=1751607550552"
            alt=""
            class="h-6 w-fit"
          />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${gold}</p>
          </div>
        </div>
        <div class="medal flex flex-col md:flex-row md:gap-2 items-center">
          <img
            src="https://ik.imagekit.io/yn9gz2n2g/others/silver.png?updatedAt=1751607529476"
            alt=""
            class="h-6 w-fit"
          />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${silver}</p>
          </div>
        </div>
        <div class="medal flex flex-col md:flex-row md:gap-2 items-center">
          <img
            src="https://ik.imagekit.io/yn9gz2n2g/others/bronze.png?updatedAt=1751607503968"
            alt=""
            class="h-6 w-fit"
          />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${bronz}</p>
          </div>
        </div>
      </div>
      <div class="points w-14 md:w-20 flex items-center gap-1 md:gap-3">
        <img
          src="https://ik.imagekit.io/yn9gz2n2g/others/coin.png?updatedAt=1751607575051"
          alt=""
          class="h-5 w-5 md:h-[30px] md:w-[30px]"
        />
        <p class="font-semibold">${student.points}</p>
      </div>
    `;

    leaderboardCardContainer.appendChild(card);
  });
}
function initLeaderBoardTopper() {
  if (rankWiseSortedData.length === 0) return;
  if (rankWiseSortedData[0].points === 0) {
    firstRankSwiper.disable();
    return;
  }
  const topRanks = [];
  let currentPoints = rankWiseSortedData[0].points;
  let group = [];

  for (const student of rankWiseSortedData) {
    if (student.points === currentPoints) {
      group.push(student);
    } else {
      topRanks.push(group);
      if (topRanks.length === 3) break;
      group = [student];
      currentPoints = student.points;
    }
  }

  if (group.length && topRanks.length < 3) {
    topRanks.push(group);
  }

  const swiperInstances = [firstRankSwiper, secondRankSwiper, thirdRankSwiper];

  topRanks.forEach((group, index) => {
    const slides = group.map((student) => {
      return `
        <div class="swiper-slide">
          <div class="winner-profile flex flex-col items-center gap-2">
            <img src="${student.pfp}" alt="" class="pfp w-[50px] h-[50px]" />
            <p class="winner-name font-semibold truncate w-[100px] lg:w-32 xl:w-40 text-center">
              ${student.firstName} <br /> ${student.lastName}
            </p>
          </div>
        </div>
      `;
    });
    if (group.length === 1) {
      swiper.disable();
    } else {
      swiperInstances[index].removeAllSlides();
      swiperInstances[index].appendSlide(slides);
      swiperInstances[index].update();
      swiper.enable();
    }
  });
}

///stats
const statsCard = document.querySelector(".stats-card");
const statsCardRank = statsCard.querySelectorAll(".rank");
const statsCardTotalStudents = statsCard.querySelectorAll(".total-student");
const statsCardName = statsCard.querySelector(".name");
const statsCardPfp = statsCard.querySelector(".image-name-wrapper img");
const statsCardPoints = statsCard.querySelector(".points");
const statsGoldCount = statsCard.querySelector(".gold-medal-wrapper p");
const statsSilverCount = statsCard.querySelector(".silver-medal-wrapper p");
const statsBronzeCount = statsCard.querySelector(".bronz-medal-wrapper p");
const leaderboardStudetPopup = document.querySelector(
  ".pick-leaderboard-studet-popup-wrapper"
);
const leaderboardStudetPopupClose =
  leaderboardStudetPopup.querySelector(".close-popup-btn");
const leaderboardStudetCardContainer =
  leaderboardStudetPopup.querySelector(".card-container");
function initStats(rankWiseSortedData) {
  const user = appState.userData;

  // Set name and pfp
  statsCardName.textContent = `${user.firstName} ${user.lastName}`;
  statsCardPfp.src = user.pfp;

  // Find user's data in ranked list
  const index = rankWiseSortedData.findIndex((s) => s.userId === user.userId);
  if (index === -1) return;

  const userRank = index + 1;
  const student = rankWiseSortedData[index];
  const medals = student.medals || {};

  // Set rank in both locations (desktop + mobile)
  statsCardRank.forEach(
    (el) => (el.textContent = userRank.toString().padStart(2, "0"))
  );

  // Set total student count
  statsCardTotalStudents.forEach(
    (el) => (el.innerHTML = `Rank <br /> out of ${rankWiseSortedData.length}`)
  );

  // Set points
  statsCardPoints.textContent = student.points;

  // Set medals
  statsGoldCount.textContent = `x ${medals.gold || 0}`;
  statsSilverCount.textContent = `x ${medals.silver || 0}`;
  statsBronzeCount.textContent = `x ${medals.bronz || 0}`;
}
let currentEditingRank = null;
previousFirstContainer.addEventListener("click", () => {
  currentEditingRank = "first";
  fadeInEffect(leaderboardStudetPopup);
});
previousSecondContainer.addEventListener("click", () => {
  currentEditingRank = "second";
  fadeInEffect(leaderboardStudetPopup);
});
previousThirdContainer.addEventListener("click", () => {
  currentEditingRank = "third";
  fadeInEffect(leaderboardStudetPopup);
});
leaderboardStudetPopupClose.addEventListener("click", () => {
  fadeOutEffect(leaderboardStudetPopup);
});
function renderStudentCardInPopup() {
  for (const key in sortedRollNoWiseStudentData) {
    const student = sortedRollNoWiseStudentData[key];
    const userId = student.userId;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 items-center border border-surface-3 p-3 md:px-4 flex justify-between rounded-xl";
    const wrapper = document.createElement("div");
    wrapper.className =
      "wrapper w-[180px] md:w-[340px] gap-1.5 md:gap-4 flex items-center justify-between";

    const namePfpWrapper = document.createElement("div");
    namePfpWrapper.className = "name-pfp-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = student.pfp;
    img.alt = "";
    img.className = "pfp h-10 w-10";

    const nameContainer = document.createElement("div");
    nameContainer.className =
      "flex flex-col leading-tight text-sm md:text-base";

    const firstName = document.createElement("p");
    firstName.className = "truncate w-full";
    firstName.textContent = student.firstName;

    const lastName = document.createElement("p");
    lastName.className = "truncate w-full";
    lastName.textContent = student.lastName;

    nameContainer.appendChild(firstName);
    nameContainer.appendChild(lastName);

    namePfpWrapper.appendChild(img);
    namePfpWrapper.appendChild(nameContainer);

    wrapper.appendChild(namePfpWrapper);
    card.appendChild(wrapper);
    const rollNo = document.createElement("p");
    rollNo.textContent = student.rollNo;

    card.appendChild(rollNo);

    leaderboardStudetCardContainer.appendChild(card);
    card.addEventListener("click", () => {
      updateRanks(userId);
    });
  }
  const wrapper = document.createElement("div");
  wrapper.className = "p-4 text-center border border-surface-3 rounded-xl";
  wrapper.innerHTML = "Remove rank";
  leaderboardStudetCardContainer.appendChild(wrapper);
  wrapper.addEventListener("click", () => {
    updateRanks(null);
  });
}
async function updateRanks(key) {
  if (key === null) {
    await updateData(
      `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/previousTestWinners`,
      { [currentEditingRank]: null }
    );
  }
  await updateData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/previousTestWinners`,
    { [currentEditingRank]: key }
  );
  fadeOutEffect(leaderboardStudetPopup);
  await syncDbData();
  loadLeaderboardSection();
}
async function getAllStudentsData() {
  rawStudentData = await get(ref(db, "users"))
    .then((snapshot) => {
      return snapshot.val();
    })
    .catch((error) => {
      console.error(error);
    });

  sortedRollNoWiseStudentData = Object.values(rawStudentData)
    .filter(
      (student) =>
        student.div === appState.activeDiv && student.sem === appState.activeSem
    )
    .sort((a, b) => a.rollNo - b.rollNo);
  console.log("this is raw data", rawStudentData);
  console.log("this is filtered data", sortedRollNoWiseStudentData);
}
function calculateRank() {
  const ranked = Object.values(sortedRollNoWiseStudentData).map((student) => {
    const medals = student.medals || {};
    const gold = medals.gold || 0;
    const silver = medals.silver || 0;
    const bronz = medals.bronz || 0;

    const points = gold * 30 + silver * 20 + bronz * 10;

    return {
      ...student,
      points,
    };
  });

  ranked.sort((a, b) => b.points - a.points);
  console.log("this is ranked", ranked);
  return ranked;
}
function initPreviousTestWinner() {
  if (!appState.divisionData.previousTestWinners) return;
  const previousTestWinners = appState.divisionData.previousTestWinners;
  for (const key in previousTestWinners) {
    const name = `${rawStudentData[previousTestWinners[key]].firstName}<br>${
      rawStudentData[previousTestWinners[key]].lastName
    }`;
    const pfp = rawStudentData[previousTestWinners[key]].pfp;
    if (key === "first") {
      previousFirstName.innerHTML = name;
      previousFirstPfp.src = pfp;
    }
    if (key === "second") {
      previousSecondName.innerHTML = name;
      previousSecondPfp.src = pfp;
    }
    if (key === "third") {
      previousThirdName.innerHTML = name;
      previousThirdPfp.src = pfp;
    }
  }
}
