import { navIcon } from "./navigation.js";
const dashboard = document.querySelector(".dashboard-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import {
  userData,
  semesterGlobalData,
  globalData,
  subjectData,
  hideSections,
} from "./index.js";
export let activeNavIcon = null;
const slider = document.querySelector(".slider");
//
function setActiveNavIcon(newIcon) {
  if (!newIcon) return;

  if (activeNavIcon) {
    activeNavIcon.classList.remove("activeIcon");
    activeNavIcon.setAttribute("fill", "#8D9DA6");
  }

  newIcon.classList.add("activeIcon");
  newIcon.setAttribute("fill", "#ffffff");
  activeNavIcon = newIcon;

  const iconWrapper = newIcon.closest(".icon-wrapper");
  const navRect = navigation.getBoundingClientRect();
  const iconRect = iconWrapper.getBoundingClientRect();
  const isLgScreen = window.innerWidth >= 1024;

  if (isLgScreen) {
    const translateY =
      iconRect.top -
      navRect.top +
      iconWrapper.offsetHeight / 2 -
      slider.offsetHeight / 2;
    slider.style.transform = `translateY(${translateY}px)`;
  } else {
    const translateX =
      iconRect.left -
      navRect.left +
      iconWrapper.offsetWidth / 2 -
      slider.offsetWidth / 2;
    slider.style.transform = `translateX(${translateX}px)`;
  }
}
export async function loadDashboard() {
  // userPfp.src = studentData.pfp;
}
export async function showDashboard() {
  await hideSections();
  await fadeOutEffect(navIcon);
  navTitle.textContent = `Hello ${studentData.firstName}`;
  await fadeInEffect(dashboard);
}
