const leaderboarSection = document.querySelector(".leaderboard-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import {
  get,
  ref,
  db,
  updateData,
  query,
  orderByChild,
  equalTo,
} from "./firebase.js";
import { hideSections, showSectionLoader, hideSectionLoader } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { appState, syncDbData } from "./appstate.js";
const DOM = {
  leaderboardSection: document.querySelector(".leaderboard-section"),
  leaderboardCardContainer: document.querySelector(
    ".leaderboard-section .leaderboard-card-container",
  ),
  studentSelectorPopup: {
    popup: document.querySelector(".pick-leaderboard-student-popup-wrapper"),
    closePopupBtn: document.querySelector(
      ".pick-leaderboard-student-popup-wrapper .close-popup-btn",
    ),
    cardContainer: document.querySelector(
      ".pick-leaderboard-student-popup-wrapper .card-container",
    ),
  },
  previousTestWinner: {
    first: {
      container: document.querySelector(
        ".previous-test-rank-container .first-winner-container",
      ),
      name: document.querySelector(
        ".previous-test-rank-container .first-winner-container .name",
      ),
      pfp: document.querySelector(
        ".previous-test-rank-container .first-winner-container .pfp",
      ),
    },
    second: {
      container: document.querySelector(
        ".previous-test-rank-container .second-winner-container",
      ),
      name: document.querySelector(
        ".previous-test-rank-container .second-winner-container .name",
      ),
      pfp: document.querySelector(
        ".previous-test-rank-container .second-winner-container .pfp",
      ),
    },
    third: {
      container: document.querySelector(
        ".previous-test-rank-container .third-winner-container",
      ),
      name: document.querySelector(
        ".previous-test-rank-container .third-winner-container .name",
      ),
      pfp: document.querySelector(
        ".previous-test-rank-container .third-winner-container .pfp",
      ),
    },
  },
  leaderboardTopper: {
    first: {
      swiper: new Swiper("#first-place-swiper", {
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
      }),
      isSingleFlag: false,
      points: document.querySelector(
        ".leaderboard-top-ranks-container .first-winner-container .points",
      ),
      podiumPoints: document.querySelector(
        ".leaderboard-top-ranks-container .first-winner-container .podium-points",
      ),
    },
    second: {
      swiper: new Swiper("#second-place-swiper", {
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
      }),
      isSingleFlag: false,
      points: document.querySelector(
        ".leaderboard-top-ranks-container .second-winner-container .points",
      ),
      podiumPoints: document.querySelector(
        ".leaderboard-top-ranks-container .second-winner-container .podium-points",
      ),
    },
    third: {
      swiper: new Swiper("#third-place-swiper", {
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
      }),
      isSingleFlag: false,
      points: document.querySelector(
        ".leaderboard-top-ranks-container .third-winner-container .points",
      ),
      podiumPoints: document.querySelector(
        ".leaderboard-top-ranks-container .third-winner-container .podium-points",
      ),
    },
  },
  statsCard: {
    rank: document.querySelector(".leaderboard-section .stats-card .rank"),
    rankSm: document.querySelector(".leaderboard-section .stats-card .rank-sm"),
    totalStudents: document.querySelectorAll(
      ".leaderboard-section .stats-card .total-student",
    ),
    name: document.querySelector(".leaderboard-section .stats-card .name"),
    pfp: document.querySelector(".leaderboard-section .stats-card .user-pfp"),
    points: document.querySelector(".leaderboard-section .stats-card .points"),
    medals: {
      gold: document.querySelector(".stats-card .gold-medal-wrapper .qty"),
      silver: document.querySelector(".stats-card .silver-medal-wrapper .qty"),
      bronze: document.querySelector(".stats-card .bronze-medal-wrapper .qty"),
    },
  },
};
let studentRawData = null;
let sortedRollNoWiseStudentData = null;
let rankWiseSortedData = null;
export async function loadLeaderboardSection() {
  await unloadLeaderBoardSection();
  studentRawData = await getStudentRawData();

  if (studentRawData && Object.keys(studentRawData).length > 0) {
    sortedRollNoWiseStudentData = Object.entries(studentRawData)
      .sort(([, a], [, b]) => a.rollNumber - b.rollNumber)
      .reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
      }, {});
  } else {
    sortedRollNoWiseStudentData = {}; // or leave undefined, depending on your needs
  }

  const medalPoints = { bronze: 10, silver: 20, gold: 30 };
  rankWiseSortedData = Object.entries(sortedRollNoWiseStudentData).reduce(
    (acc, [userId, user]) => {
      const { firstName, lastName, medalList, pfpLink } = user;
      const bronze = medalList.bronze || 0;
      const silver = medalList.silver || 0;
      const gold = medalList.gold || 0;
      const totalPoints =
        bronze * medalPoints.bronze +
        silver * medalPoints.silver +
        gold * medalPoints.gold;
      acc[userId] = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        pfpLink,
        bronze,
        silver,
        gold,
        totalPoints,
        userId,
      };
      return acc;
    },
    {},
  );
  initLeaderBoardTopper();
  renderLeaderboardCards();
  initPreviousTestWinner();
  renderStudentCardInPopup();
  initStats();
}
async function unloadLeaderBoardSection() {
  await fadeOutEffect(leaderboarSection);
  DOM.studentSelectorPopup.cardContainer.innerHTML = "";
  DOM.leaderboardCardContainer.innerHTML = "";
}
export async function showLeaderboardSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/leaderboard.png?updatedAt=1751607436911";
  headerTitle.textContent = "Leaderboard";
  await hideSections();
  await fadeInEffect(leaderboarSection);
  DOM.leaderboardTopper.first.swiper.update();
  DOM.leaderboardTopper.second.swiper.update();
  DOM.leaderboardTopper.third.swiper.update();
  if (DOM.leaderboardTopper.first.isSingleFlag)
    DOM.leaderboardTopper.first.swiper.autoplay.stop();
  else DOM.leaderboardTopper.first.swiper.autoplay.start();

  if (DOM.leaderboardTopper.second.isSingleFlag)
    DOM.leaderboardTopper.second.swiper.autoplay.stop();
  else DOM.leaderboardTopper.second.swiper.autoplay.start();

  if (DOM.leaderboardTopper.third.isSingleFlag)
    DOM.leaderboardTopper.third.swiper.autoplay.stop();
  else DOM.leaderboardTopper.third.swiper.autoplay.start();
}
function renderLeaderboardCards() {
  DOM.leaderboardCardContainer.innerHTML = "";
  const students = Object.values(rankWiseSortedData);

  students.sort((a, b) => b.totalPoints - a.totalPoints);
  let previousPts = null;
  let rank = 0;
  students.forEach((student, index) => {
    const gold = student.gold || 0;
    const silver = student.silver || 0;
    const bronze = student.bronze || 0;
    const firstName = student.firstName || "";
    const lastName = student.lastName || "";
    const points = student.totalPoints || 0;
    const pfp = student.pfpLink || "";
    if (previousPts !== points && points > 0) {
      rank++;
    }
    const displayRank = points === 0 ? "--" : rank;
    previousPts = points;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 px-3 py-4 md:px-4 flex justify-between rounded-lg";
    card.innerHTML = `
      <div class="name-pfp-rank-wrapper min-w-0 w-[11rem] md:w-[22rem] gap-1.5 md:gap-4 flex items-center">
        <p class="rank ${
          displayRank === "--" ? "text-sm" : "md:text-xl"
        } w-[1.125rem] md:w-[1.625rem] text-center">${displayRank}</p>
        <div class="name-pfp-wrapper min-w-0 flex items-center gap-1 md:gap-2">
          <img src="${pfp}" alt="" class="pfp h-10 w-10" />
          <div class="flex flex-col leading-tight md:gap-1.5 text-sm md:text-base md:flex-row md:flex-wrap">
           <p class="md:w-full w-[6rem] min-w-0  truncate">${firstName}</p>
          <p class="md:w-full w-[6rem] min-w-0  truncate">${lastName}</p>
          </div>
          </div>
        </div>
      </div>

      <div class="medals-wrapper flex gap-3 md:w-[12rem] md:justify-between">
        <div class="medal flex flex-col shrink-0 md:flex-row md:gap-2 items-center">
          <img src="https://ik.imagekit.io/yn9gz2n2g/others/gold.png?updatedAt=1751607550552" alt="" class="h-6 w-auto " />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${gold}</p>
          </div>
        </div>
        <div class="medal flex flex-col shrink-0 md:flex-row md:gap-2 items-center">
          <img src="https://ik.imagekit.io/yn9gz2n2g/others/silver.png?updatedAt=1751607529476" alt="" class="h-6 w-auto " />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${silver}</p>
          </div>
        </div>
        <div class="medal flex flex-col shrink-0 md:flex-row md:gap-2 items-center">
          <img src="https://ik.imagekit.io/yn9gz2n2g/others/bronze.png?updatedAt=1751607503968" alt="" class="h-6 w-auto " />
          <div class="wrapper flex items-center">
            <p class="text-xs">x</p>
            <p class="text-xs md:text-base">${bronze}</p>
          </div>
        </div>
      </div>

      <div class="points w-14 ml-4 md:w-20 flex items-center gap-1 md:gap-3">
        <img src="https://ik.imagekit.io/yn9gz2n2g/others/coin.png?updatedAt=1751607575051" alt="" class="h-5 w-5 md:h-[1.9rem] md:w-[1.9rem]" />
        <p class="font-semibold">${points}</p>
      </div>
    `;
    DOM.leaderboardCardContainer.appendChild(card);
  });
}
function initLeaderBoardTopper() {
  const swipers = [
    DOM.leaderboardTopper.first.swiper,
    DOM.leaderboardTopper.second.swiper,
    DOM.leaderboardTopper.third.swiper,
  ];
  const podiumPoints = [
    DOM.leaderboardTopper.first.podiumPoints,
    DOM.leaderboardTopper.second.podiumPoints,
    DOM.leaderboardTopper.third.podiumPoints,
  ];
  const students = Object.values(rankWiseSortedData);
  students.sort((a, b) => b.totalPoints - a.totalPoints);

  //  top 3 unique non-zero point values
  const uniquePoints = [...new Set(students.map((s) => s.totalPoints))]
    .filter((pt) => pt > 0)
    .slice(0, 3);

  //  students by their rank based on point
  const top3Groups = uniquePoints.map((points) =>
    students.filter((s) => s.totalPoints === points),
  );
  if (top3Groups.length === 0) {
    DOM.leaderboardTopper.first.isSingleFlag = true;
    DOM.leaderboardTopper.second.isSingleFlag = true;
    DOM.leaderboardTopper.third.isSingleFlag = true;
  }
  // loop top 3 ranks
  top3Groups.forEach((group, i) => {
    const swiper = swipers[i];
    if (!swiper) return;
    podiumPoints[i].textContent = group[0].totalPoints;
    if (group.length <= 1) {
      const student = group[0];
      const slide = createWinnerSlide(student);
      swiper.removeAllSlides();
      swiper.appendSlide(slide);
      DOM.leaderboardTopper[["first", "second", "third"][i]].isSingleFlag =
        true;
      swiper.autoplay.stop();
      swiper.allowTouchMove = false;
    } else {
      swiper.removeAllSlides();
      group.forEach((student) => {
        const slide = createWinnerSlide(student);
        swiper.appendSlide(slide);
      });
    }
  });
}
function createWinnerSlide(student) {
  return `
    <div class="swiper-slide">
      <div class="winner-profile flex flex-col items-center gap-2">
        <img src="${student.pfpLink}" alt="" class="pfp w-12 h-12" />
        <p class="winner-name font-semibold truncate w-[6.25rem] lg:w-32 xl:w-40 text-center">
          ${student.name.split(" ")[0]} <br /> ${
            student.name.split(" ")[1] || ""
          }
        </p>
      </div>
    </div>
  `;
}
function initStats() {
  const totalStudents = Object.keys(rankWiseSortedData).length;
  DOM.statsCard.totalStudents.forEach((el) => {
    el.innerHTML = `Rank <br /> out of ${totalStudents}`;
  });
  appState.totalStudents = totalStudents;

  if (
    appState.userData.role === "teacher" ||
    appState.userData.role === "admin"
  )
    return;
  DOM.statsCard.name.textContent = `${appState.userData.firstName} ${appState.userData.lastName}`;
  DOM.statsCard.pfp.src = appState.userData.pfpLink;
  let userRank = 0;
  let student = null;
  for (const key in rankWiseSortedData) {
    if (rankWiseSortedData[key].userId === appState.userId) {
      student = rankWiseSortedData[key];
      userRank = userRank + 1;
      break;
    }
    userRank = userRank + 1;
  }
  const points = student.totalPoints || 0;
  if (points === 0) {
    DOM.statsCard.rank.textContent = "--";
    DOM.statsCard.rankSm.textContent = "--";
    userRank = "--";
  } else {
    DOM.statsCard.rank.textContent = userRank.toString().padStart(2, "0");
    DOM.statsCard.rankSm.textContent = userRank.toString().padStart(2, "0");
  }
  DOM.statsCard.points.textContent = points;
  DOM.statsCard.medals.gold.textContent = `x ${student.gold || 0}`;
  DOM.statsCard.medals.silver.textContent = `x ${student.silver || 0}`;
  DOM.statsCard.medals.bronze.textContent = `x ${student.bronze || 0}`;
  appState.userData.rank = userRank;
  appState.userData.points = points;
}
let currentEditingRank = null;
DOM.previousTestWinner.first.container.addEventListener("click", () => {
  if (!appState.isEditing) return;
  currentEditingRank = "first";
  fadeInEffect(DOM.studentSelectorPopup.popup);
});
DOM.previousTestWinner.second.container.addEventListener("click", () => {
  if (!appState.isEditing) return;
  currentEditingRank = "second";
  fadeInEffect(DOM.studentSelectorPopup.popup);
});
DOM.previousTestWinner.third.container.addEventListener("click", () => {
  if (!appState.isEditing) return;
  currentEditingRank = "third";
  fadeInEffect(DOM.studentSelectorPopup.popup);
});
DOM.studentSelectorPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.studentSelectorPopup.popup);
});

function renderStudentCardInPopup() {
  for (const key in sortedRollNoWiseStudentData) {
    const student = sortedRollNoWiseStudentData[key];
    const userId = student.userId;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 items-center border border-surface-3 p-3 md:px-4 flex justify-between rounded-xl cursor-pointer";
    const wrapper = document.createElement("div");
    wrapper.className =
      "wrapper w-[12rem] md:w-[22rem] gap-1.5 md:gap-4 flex items-center justify-between";

    const namePfpWrapper = document.createElement("div");
    namePfpWrapper.className = "name-pfp-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = student.pfpLink;
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
    rollNo.textContent = student.rollNumber;

    card.appendChild(rollNo);

    DOM.studentSelectorPopup.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      updateRanks(userId);
    });
  }
  const wrapper = document.createElement("div");
  wrapper.className =
    "p-4 text-center border border-surface-3 rounded-xl cursor-pointer";
  wrapper.innerHTML = "Remove rank";
  DOM.studentSelectorPopup.cardContainer.appendChild(wrapper);
  wrapper.addEventListener("click", () => {
    updateRanks(null);
  });
}
async function updateRanks(key) {
  if (key === null) {
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/previousTestWinnerList`,
      { [currentEditingRank]: null },
    );
  }
  await updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/previousTestWinnerList`,
    { [currentEditingRank]: key },
  );
  fadeOutEffect(DOM.studentSelectorPopup.popup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  await loadLeaderboardSection();
  showLeaderboardSection();
}
function initPreviousTestWinner() {
  const previousTestWinners =
    appState?.divisionData?.testData?.previousTestWinnerList || {};
  if (!previousTestWinners || Object.keys(previousTestWinners).length === 0) {
    return;
  }
  for (const key in previousTestWinners) {
    const name = `${studentRawData[previousTestWinners[key]].firstName}<br>${
      studentRawData[previousTestWinners[key]].lastName
    }`;
    const pfp = studentRawData[previousTestWinners[key]].pfpLink;
    if (key === "first") {
      DOM.previousTestWinner.first.name.innerHTML = name;
      DOM.previousTestWinner.first.pfp.src = pfp;
    }
    if (key === "second") {
      DOM.previousTestWinner.second.name.innerHTML = name;
      DOM.previousTestWinner.second.pfp.src = pfp;
    }
    if (key === "third") {
      DOM.previousTestWinner.third.name.innerHTML = name;
      DOM.previousTestWinner.third.pfp.src = pfp;
    }
  }
}
function getStudentRawData() {
  const usersRef = ref(db, "userData");
  const q = query(
    usersRef,
    orderByChild("class"),
    equalTo(`${appState.activeSem}${appState.activeDiv}`),
  );

  return get(q).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
    }
  });
}
