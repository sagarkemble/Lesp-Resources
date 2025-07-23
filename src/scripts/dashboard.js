import { appState } from "./appstate.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
export async function loadDashboard() {
  // rederNotices();
  renderUpcomingSubmissions();
}
export async function showDashboard() {
  headerTitle.textContent = `Hello ${appState.userData.firstName}`;
  await hideSections(false, true, true);
  await fadeInEffect(dashboardSection);
}
const dashboardSection = document.querySelector(".dashboard-section");

// upcoming submission
const upcomingSubmission = dashboardSection.querySelector(
  ".upcoming-submissions"
);
const upcomingSubmissionCardContainer = upcomingSubmission.querySelector(
  ".upcoming-submissions .card-container"
);
function renderUpcomingSubmissions() {
  if (!appState.subjectData || !appState.subjectData.upcomingSubmissions) {
    console.error("No subject data available");
    return;
  }
  const upcomingSubmissions = appState.subjectData.upcomingSubmissions;
  const subjectMetaData = appState.subjectData.subjectMetaData;
  for (const key in upcomingSubmissions) {
    const subject = upcomingSubmissions[key];
    console.log(key);
    const subjectName = subjectMetaData[key].name;
    const subjectIcon = subjectMetaData[key].icon;
    for (const key2 in subject) {
      const submission = subject[key2];
      const card = document.createElement("div");
      card.classList.add(
        "card",
        "p-4",
        "bg-surface-2",
        "rounded-[20px]",
        "flex",
        "flex-col",
        "lg:gap-3",
        "py-5"
      );
      card.innerHTML = `
       <div class="wrapper flex items-center gap-1 lg:gap-3 pt-1 ">
                <img
                  src="${subjectIcon}"
                  alt=""
                  class="w-[25px] h-[25px] lg:w-[40px] lg:h-[40px]"
                />
                <p class="subject-name font-semibold text-text-primary">${subjectName}</p>
              </div>
              <div class="wrapper flex flex-col lg:gap-1 text-text-secondary">
                <p class="description">${submission.title}</p>
                <p class="submission-date">${submission.date}</p>
              </div>
      `;
      upcomingSubmissionCardContainer.appendChild(card);
    }
  }
}
const swiper = new Swiper("#dashboard-upcoming-sessions-swiper", {
  direction: "horizontal",
  loop: true,
  // speed: 0,
  // effect: "fade",
  slidesPerView: 1,
  spaceBetween: 30,
  autoplay: {
    delay: 2000,
  },

  fadeEffect: {
    crossFade: true,
  },
});
const timetableSwiper = new Swiper("#dashboard-time-table-swiper", {
  direction: "horizontal",
  loop: true,
  slidesPerView: 1,
  spaceBetween: 30,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  navigation: {
    nextEl: "#dashboard-time-table-swiper .swiper-button-next",
    prevEl: "#dashboard-time-table-swiper .swiper-button-prev",
  },
});
