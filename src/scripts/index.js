import { app, auth, onAuthStateChanged, signOut } from "./firebase.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { showDashboard, loadDashboard } from "./dashboard.js";
import { loadTestSection, showTestsSection } from "./tests.js";
import {
  headerIcon,
  headerTitle,
  header,
  setActiveNavIcon,
  dashboardIcon,
  subjectIcon,
  leaderboardIcon,
  loadSubjectSelectionList,
  sessionsIcon,
  timeTabelIcon,
  testsIcon,
  sideBar,
  subjectSelectorPopup,
} from "./navigation.js";
import { loadSubjectSection } from "./subject.js";
import { showLoginSection, showResetPasswordSection } from "./login.js";
import { showSessionsSection, loadSessionsSection } from "./sessions.js";
import {
  loadLeaderboardSection,
  showLeaderboardSection,
} from "./leaderboard.js";
import { initAdminRouting } from "./admin.js";
import {
  appState,
  initAppState,
  getUserData,
  adminAppState,
  signOutUser,
} from "./appstate.js";
import { showErrorSection } from "./error.js";
const loadingScreen = document.querySelector(".loading-screen");
const lotteLoader = document.querySelector("#lotte-loader");
const sectionLoader = document.querySelector(".section-loader-wrapper");
const sectionLoaderMessage = sectionLoader.querySelector(".loader-status");
const editModeToggleButton = document.querySelector(".edit-mode-toggle-btn");
const confirmationPopup = document.querySelector(".confirmation-popup-wrapper");
const confirmationDescription = confirmationPopup.querySelector(".description");
const confirmationTitle = confirmationPopup.querySelector(".title");
const confirmButton = confirmationPopup.querySelector(".confirm-btn");
const cancelButton = confirmationPopup.querySelector(".cancel-btn");
export async function showSectionLoader(message = "Loading...") {
  sectionLoaderMessage.textContent = message;
  await fadeInEffect(sectionLoader);
}
export async function hideSectionLoader() {
  await fadeOutEffect(sectionLoader);
}
async function loadContent() {
  await loadDashboard();
  await loadTestSection();
  await loadSubjectSelectionList();
  await loadLeaderboardSection();
  await loadSessionsSection();
}
export async function showConfirmationPopup(
  description = "This action cannot be undone.",
  title = "Are you sure?"
) {
  return new Promise((resolve) => {
    confirmationTitle.textContent = title;
    confirmationDescription.textContent = description;
    fadeInEffect(confirmationPopup);
    confirmButton.addEventListener("click", async () => {
      await fadeOutEffect(confirmationPopup);
      resolve(true);
    });
    cancelButton.addEventListener("click", async () => {
      await fadeOutEffect(confirmationPopup);
      resolve(false);
    });
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  // if (true) {
  //   await signOutUser();
  //   // return;
  // }
  await fadeInEffect(loadingScreen);
  onAuthStateChanged(auth, async (userCredential) => {
    if (userCredential) {
      const user = await getUserData();
      if (user.role === "admin") {
        console.log("Admin user detected");
        await fadeOutEffect(loadingScreen);
        initAdminRouting(user);
        return;
      }
      await initAppState();
      await fadeInEffect(loadingScreen);
      await hideSections();
      await loadContent();
      await applyEditModeUI();
      initRouting();
    } else {
      await fadeOutEffect(loadingScreen);
      await showLoginSection();
    }
  });
});
export async function initRouting() {
  const params = new URLSearchParams(window.location.search);
  const dashboard = params.get("dashboard");
  const activeSubject = params.get("subject");
  const leaderboard = params.get("leaderboard");
  const tests = params.get("tests");
  const pyq = params.get("pyq");
  const sessions = params.get("sessions");
  if (dashboard) {
    setActiveNavIcon(dashboardIcon);
    await fadeOutEffect(loadingScreen);
    showDashboard();
  } else if (activeSubject) {
    appState.activeSubject = activeSubject;
    setActiveNavIcon(subjectIcon);
    await fadeOutEffect(loadingScreen);
    loadSubjectSection();
  } else if (leaderboard) {
    setActiveNavIcon(leaderboardIcon);
    await fadeOutEffect(loadingScreen);
    showLeaderboardSection();
  } else if (tests) {
    setActiveNavIcon(testsIcon);
    await fadeOutEffect(loadingScreen);
    showTestsSection();
  } else if (sessions) {
    setActiveNavIcon(sessionsIcon);
    await fadeOutEffect(loadingScreen);
    showSessionsSection();
  } else if (pyq) {
    await fadeOutEffect(loadingScreen);
    showPyq();
  } else {
    setActiveNavIcon(dashboardIcon);
    await fadeOutEffect(loadingScreen);
    showDashboard();
  }
}
export async function hideSections(
  showHeaderIcon = true,
  showHeaderTitle = true,
  showSidebar = true,
  showHeader = true
) {
  if (!showSidebar)
    document.querySelector("main").classList.remove("lg:ml-[4.375rem]");
  else document.querySelector("main").classList.add("lg:ml-[4.375rem]");
  await (showHeaderIcon ? fadeInEffect(headerIcon) : fadeOutEffect(headerIcon));
  await (showHeaderTitle
    ? fadeInEffect(headerTitle)
    : fadeOutEffect(headerTitle));
  await (showSidebar ? fadeInEffect(sideBar) : fadeOutEffect(sideBar));
  await (showHeader ? fadeInEffect(header) : fadeOutEffect(header));
  const allSections = document.querySelectorAll("section");
  fadeOutEffect(subjectSelectorPopup);
  for (const section of allSections) {
    await fadeOutEffect(section);
  }
}
editModeToggleButton.addEventListener("click", () => {
  appState.isEditing = !appState.isEditing;
  // console.log(appState.isEditing);
  if (appState.isEditing) {
    editModeToggleButton.textContent = "Exit mode";
    applyEditModeUI();
  } else {
    editModeToggleButton.textContent = "Edit";
    applyEditModeUI();
  }
});
export async function applyEditModeUI() {
  const editorTool = document.querySelectorAll(".editor-tool");
  const editorOnlyContent = document.querySelectorAll(".editor-only-content");
  const editorOnlyContentCard = document.querySelectorAll(
    ".editor-only-content-card"
  );
  const subjectSectionUpcomingSubmissions = document.querySelector(
    ".subject-page-section .upcoming-submissions"
  );
  if (appState.isEditing) {
    editorOnlyContent.forEach((content) => fadeInEffect(content));
    editorOnlyContentCard.forEach((card) => {
      const wrapper = card.closest("a");
      if (wrapper?.classList.contains("hidden")) {
        fadeInEffect(wrapper);
      }
      fadeInEffect(card);
      if (card.classList.contains("visiblity-hidden")) {
        card.style.opacity = "0.5";
      }
    });
    editorTool.forEach((tool) => fadeInEffect(tool));
    editModeToggleButton.textContent = "Exit editing";
    fadeInEffect(subjectSectionUpcomingSubmissions);
  } else {
    if (
      !appState.subjectData.subjectSectionUpcomingSubmissions ||
      !appState.subjectData.subjectSectionUpcomingSubmissions[
        appState.activeSubject
      ]
    ) {
      fadeOutEffect(subjectSectionUpcomingSubmissions);
    }
    editorOnlyContent.forEach((content) => fadeOutEffect(content));
    editorOnlyContentCard.forEach((card) => {
      fadeOutEffect(card);
      const wrapper = card.closest("a");
      if (wrapper) fadeOutEffect(wrapper);
    });
    editorTool.forEach((tool) => fadeOutEffect(tool));
    editModeToggleButton.textContent = "Edit";
  }
}
window.addEventListener("popstate", () => {
  if (appState.userData.role === "admin") {
    initAdminRouting();
  } else {
    initRouting();
  }
  // initRouting();
});
