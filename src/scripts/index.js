import {
  app,
  auth,
  onAuthStateChanged,
  signOutUser,
  setUserId,
  analytics,
  logEvent,
} from "./firebase.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
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
  timeTableIcon,
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
} from "./appstate.js";
import { showErrorSection } from "./error.js";
import * as Sentry from "@sentry/browser";
Sentry.init({
  dsn: "https://9f9da5737a2f44249457aa7e774fe3d2@o4509828633788416.ingest.us.sentry.io/4509828649189376",
  sendDefaultPii: true,
});
export const lottieLoadingScreen = document.querySelector(
  ".lottie-loading-screen",
);
const lottieLoader = document.querySelector("#lottie-loader");
const sectionLoader = document.querySelector(".task-loader-wrapper");
const sectionLoaderMessage = sectionLoader.querySelector(".loader-status");
const editModeToggleButton = document.querySelector(".edit-mode-toggle-btn");
const confirmationPopup = document.querySelector(".confirmation-popup-wrapper");
const confirmationDescription = confirmationPopup.querySelector(".description");
const confirmationTitle = confirmationPopup.querySelector(".title");
const confirmButton = confirmationPopup.querySelector(".confirm-btn");
const cancelButton = confirmationPopup.querySelector(".cancel-btn");
const lgUserPfp = document.querySelector(".navigation-user-pfp");
let localUserData;
let isSignupWithQueryParams = false;
export let isNewUser = { flag: false };
export async function showSectionLoader(message = "Loading...") {
  sectionLoaderMessage.textContent = message;
  await fadeInEffect(sectionLoader);
}
export async function hideSectionLoader() {
  await fadeOutEffect(sectionLoader);
}
async function loadContent() {
  await loadTestSection();
  await loadSubjectSelectionList();
  await loadLeaderboardSection();
  await loadSessionsSection();
  await loadDashboard();
}
export async function showConfirmationPopup(
  description = "This action cannot be undone.",
  title = "Are you sure?",
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
  try {
    await fadeInEffect(lottieLoadingScreen);
    onAuthStateChanged(auth, async (userCredential) => {
      try {
        if (isNewUser.flag) return;
        if (userCredential) {
          console.log(userCredential);
          setUserId(analytics, userCredential.uid);
          logEvent(analytics, "login", { method: "firebase" });
          const user = await getUserData(userCredential.uid);
          console.log(user);

          if (user.role === "admin") {
            localUserData = user;
            await fadeOutEffect(lottieLoadingScreen);
            initAdminRouting(user);
            return;
          }
          const userPfp = document.querySelectorAll(".user-pfp");
          userPfp.forEach((pfp) => {
            pfp.src = user.pfpLink;
          });
          await initAppState(user, user.semester, user.division);
          await fadeInEffect(lottieLoadingScreen);
          await hideSections();
          await loadContent();
          await applyEditModeUI();
          initRouting();
        } else {
          await fadeOutEffect(lottieLoadingScreen);
          await showLoginSection();
        }
      } catch (error) {
        showErrorSection();
        console.error("Error during authentication state change.", error);
        Sentry.captureException(error);
      }
    });
  } catch (error) {
    showErrorSection();
    console.error("Error during initialization.", error);
    Sentry.captureException(error);
  }
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
    await showDashboard();
    await fadeOutEffect(lottieLoadingScreen);
  } else if (activeSubject) {
    appState.activeSubject = activeSubject;
    trackPageView(
      "subject_page",
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
    );
    setActiveNavIcon(subjectIcon);
    await loadSubjectSection();
    await fadeOutEffect(lottieLoadingScreen);
  } else if (leaderboard) {
    setActiveNavIcon(leaderboardIcon);
    await showLeaderboardSection();
    await fadeOutEffect(lottieLoadingScreen);
  } else if (tests) {
    setActiveNavIcon(testsIcon);
    await fadeOutEffect(lottieLoadingScreen);
    showTestsSection();
  } else if (sessions) {
    setActiveNavIcon(sessionsIcon);
    await fadeOutEffect(lottieLoadingScreen);
    showSessionsSection();
  } else if (pyq) {
    await fadeOutEffect(lottieLoadingScreen);
    showPyq();
  } else {
    setActiveNavIcon(dashboardIcon);
    await showDashboard();
    await fadeOutEffect(lottieLoadingScreen);
  }
}
export async function hideSections(
  showHeaderIcon = true,
  showHeaderTitle = true,
  showSidebar = true,
  showHeader = true,
) {
  if (!showSidebar)
    document.querySelector("main").classList.remove("lg:ml-[4.375rem]");
  else document.querySelector("main").classList.add("lg:ml-[4.375rem]");
  await (showHeaderIcon ? showElement(headerIcon) : hideElement(headerIcon));
  await (showHeaderTitle ? showElement(headerTitle) : hideElement(headerTitle));
  await (showSidebar ? showElement(sideBar) : hideElement(sideBar));
  await (showHeader ? showElement(header) : hideElement(header));
  const allSections = document.querySelectorAll("section");
  hideElement(subjectSelectorPopup);
  for (const section of allSections) {
    await hideElement(section);
  }
}
editModeToggleButton.addEventListener("click", () => {
  appState.isEditing = !appState.isEditing;
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
    ".editor-only-content-card",
  );
  const subjectSectionUpcomingSubmissions = document.querySelector(
    ".subject-page-section .upcoming-submissions",
  );
  const editorMousePointer = document.querySelectorAll(".editor-hover-pointer");
  if (appState.isEditing) {
    editorOnlyContent.forEach((content) => showElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "pointer";
    });
    editorOnlyContentCard.forEach((card) => {
      const wrapper = card.closest("a");
      if (wrapper?.classList.contains("hidden")) {
        showElement(wrapper);
      }
      showElement(card);
      if (card.classList.contains("visiblity-hidden")) {
        card.style.opacity = "0.5";
      }
    });
    editorTool.forEach(async (tool) => showElement(tool));
    editModeToggleButton.textContent = "Exit editing";
    showElement(subjectSectionUpcomingSubmissions);
  } else {
    const submissions =
      (appState.divisionData?.upcomingSubmissionData || {})[
        appState.activeSubject
      ] || {};
    if (!submissions || !Object.keys(submissions).length) {
      hideElement(subjectSectionUpcomingSubmissions);
    }
    editorOnlyContent.forEach((content) => hideElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "default";
    });
    editorOnlyContentCard.forEach((card) => {
      hideElement(card);
      const wrapper = card.closest("a");
      if (wrapper) hideElement(wrapper);
    });
    editorTool.forEach((tool) => hideElement(tool));
    editModeToggleButton.textContent = "Edit";
  }
}
window.addEventListener("popstate", () => {
  if (localUserData.role === "admin") {
    initAdminRouting();
  } else {
    initRouting();
  }
});
function trackPageView(pageName, sem, div, subject) {
  logEvent(analytics, "page_view_custom", {
    page_name: pageName,
    semester: appState.activeSem,
    division: appState.activeDiv,
    subject: subject || "N/A",
  });
}
import { registerSW } from "virtual:pwa-register";
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Refresh?")) {
      updateSW();
    }
  },
  onOfflineReady() {},
});
