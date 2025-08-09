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
const lottieLoadingScreen = document.querySelector(".lottie-loading-screen");
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
  await fadeInEffect(lottieLoadingScreen);
  onAuthStateChanged(auth, async (userCredential) => {
    if (userCredential) {
      setUserId(analytics, userCredential.uid);
      logEvent(analytics, "login", { method: "firebase" });
      // Just to test Analytics works at all
      logEvent(analytics, "test_event", { debug: true });

      console.log("event logged");
      const user = await getUserData(userCredential.uid);

      console.log("this is user data ", user);
      if (user.role === "admin") {
        localUserData = user;
        await fadeOutEffect(lottieLoadingScreen);
        initAdminRouting(user);
        return;
      }
      await initAppState(user, user.semester, user.division);
      console.log("App state initialized", appState);
      await fadeInEffect(lottieLoadingScreen);
      await hideSections();
      await loadContent();
      await applyEditModeUI();
      lgUserPfp.src = user.pfpLink;
      initRouting();
    } else {
      await fadeOutEffect(lottieLoadingScreen);
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
    await fadeOutEffect(lottieLoadingScreen);
    showDashboard();
  } else if (activeSubject) {
    appState.activeSubject = activeSubject;
    trackPageView(
      "subject_page",
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
    );

    setActiveNavIcon(subjectIcon);
    await fadeOutEffect(lottieLoadingScreen);
    loadSubjectSection();
  } else if (leaderboard) {
    setActiveNavIcon(leaderboardIcon);
    await fadeOutEffect(lottieLoadingScreen);
    showLeaderboardSection();
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
    await fadeOutEffect(lottieLoadingScreen);
    showDashboard();
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
      console.log("No upcoming submissions found from index.");
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
  // initRouting();
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
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
