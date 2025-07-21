import { initRouting } from "./index.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
const sideBarContent = document.querySelector(".side-bar-content");
import { appState } from "./appstate.js";
export const sideBar = document.querySelector("nav");
export let activeNavIcon = null;
const slider = document.querySelector(".slider");
export const subjectSelectorPopup = document.querySelector(
  ".subject-selector-popup"
);
const subjectSelectorCardWrapper = document.querySelector(
  ".subject-selector-popup .card-wrapper"
);
export const header = document.querySelector("header");
export const headerIcon = document.querySelector(".header-icon");
export const headerTitle = document.querySelector(".header-title");
export function setActiveNavIcon(newIcon) {
  if (!newIcon) return;
  if (activeNavIcon) {
    activeNavIcon.classList.remove("activeIcon");
    activeNavIcon.setAttribute("fill", "#8D9DA6");
  }
  newIcon.classList.add("activeIcon");
  newIcon.setAttribute("fill", "#ffffff");
  activeNavIcon = newIcon;
  const iconWrapper = newIcon.closest(".icon-wrapper");
  const navRect = sideBarContent.getBoundingClientRect();
  const iconRect = iconWrapper.getBoundingClientRect();
  const isLgScreen = window.innerWidth >= 1024;
  if (isLgScreen) {
    const translateY =
      iconRect.top -
      navRect.top +
      iconWrapper.offsetHeight / 2 -
      slider.offsetHeight / 2 -
      12;
    slider.style.transform = `translateY(${translateY}px)`;
  } else {
    const translateX =
      iconRect.left -
      navRect.left +
      iconWrapper.offsetWidth / 2 -
      slider.offsetWidth / 2 -
      1.5;
    slider.style.transform = `translateX(${translateX}px)`;
  }
}
export const dashboardIcon = document.querySelector(".home-icon");
export const subjectIcon = document.querySelector(".subject-icon");
export const leaderboardIcon = document.querySelector(".leaderboard-icon");
export const sessionsIcon = document.querySelector(".sessions-icon");
export const timeTabelIcon = document.querySelector(".timetabel-icon");
export const testsIcon = document.querySelector(".tests-icon");
const smMdHeaderPfp = document.querySelector(".sm-md-header-pfp");
const loginSection = document.querySelector(".login-section");
dashboardIcon.addEventListener("click", (e) => {
  console.log(e.target);
  history.pushState({}, "", "/?dashboard=''");
  initRouting();
});
subjectIcon.addEventListener("click", (e) => {
  if (window.innerWidth <= 1024) {
    const rect = subjectIcon.getBoundingClientRect();
    const f = rect.left;
    console.log(f);
    subjectSelectorPopup.style.left = `${f}px`;
  }
  if (!subjectSelectorPopup.classList.contains("hidden")) {
    fadeOutEffect(subjectSelectorPopup);
  } else fadeInEffect(subjectSelectorPopup);
  // setActiveNavIcon(subjectIcon);
});
leaderboardIcon.addEventListener("click", () => {
  history.pushState({}, "", "/?leaderboard=''");
  initRouting();
});
sessionsIcon.addEventListener("click", () => {
  history.pushState({}, "", '?sessions=""');
  initRouting();
});
timeTabelIcon.addEventListener("click", () => {
  setActiveNavIcon(timeTabelIcon);
});
testsIcon.addEventListener("click", () => {
  history.pushState({}, "", '?tests=""');
  initRouting();
});
export function loadSubjectSelectionList() {
  console.log(appState.subjectData);

  for (const key in appState.subjectData.individualSubjects) {
    const subject = appState.subjectData.individualSubjects[key];
    const subjectCard = document.createElement("div");
    subjectCard.className =
      "subject-card w-[108px] bg-surface-2 flex px-3 py-2 rounded-md justify-start items-center gap-4";

    const img = document.createElement("img");
    img.src = subject.icon;
    img.className = "w-8 h-8";
    img.alt = "";

    const text = document.createElement("p");
    text.className = "font-semibold";
    text.textContent = subject.name;
    subjectCard.appendChild(img);
    subjectCard.appendChild(text);
    subjectCard.addEventListener("click", () => {
      history.pushState({}, "", `?subject=${subject.name}`);
      fadeOutEffect(subjectSelectorPopup);
      initRouting();
    });
    subjectSelectorCardWrapper.appendChild(subjectCard);
  }
}
let lastScrollY = window.scrollY;
function handleScroll() {
  if (window.innerWidth < 1024) {
    if (window.scrollY > lastScrollY) {
      sideBar.style.transform = "translateY(160%)";
      fadeOutEffect(subjectSelectorPopup);
    } else {
      sideBar.style.transform = "translateY(0)";
    }
  } else {
    sideBar.style.transform = "translateY(0)"; //
  }
  lastScrollY = window.scrollY;
}
window.addEventListener("scroll", handleScroll);
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    fadeOutEffect(smMdHeaderPfp);
  } else {
    fadeInEffect(smMdHeaderPfp);
  }
});
