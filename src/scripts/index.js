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
import {
  loginSection,
  showLoginSection,
  showResetPasswordSection,
  toggleFormState,
  resetForm,
} from "./login.js";
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
// import posthog from "posthog-js";
// posthog.init("phc_UUXjQythPW9iojWal45runQ8gCQId8Ku5PYrPSofo6h", {
//   api_host: "https://us.i.posthog.com",
//   person_profiles: "identified_only",
// });
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
export let localUserData = {
  userData: undefined,
  isVisitingClass: false,
};
const selectClassPopup = document.querySelector(".select-class-popup-wrapper");
const selectClassPopupCloseButton =
  selectClassPopup.querySelector(".close-popup-btn");
const selectClassCardContainer =
  selectClassPopup.querySelector(".card-container");
export async function showSelectClassPopup(user) {
  selectClassCardContainer.innerHTML = "";
  const classList = user.assignedClasses;
  if (Object.keys(classList).length === 1) {
    const [sem, div] = Object.keys(classList)[0].split("");
    localUserData.userData = user;
    localUserData.userData.class = `${sem}${div}`;
    hideSectionLoader();
    initClass();
    return;
  }
  const numMap = {
    1: "FYCO",
    2: "FYCO",
    3: "SYCO",
    4: "SYCO",
    5: "TYCO",
    6: "TYCO",
  };
  for (const key in classList) {
    const semesterNum = key[0];
    const division = key[1];
    const card = document.createElement("div");
    card.className =
      "bg-surface-3 w-full rounded-[1.25rem] p-4 text-center cursor-pointer custom-hover";
    card.setAttribute("semester", semesterNum);
    card.setAttribute("division", division);
    card.innerHTML = `${numMap[semesterNum]}-${division}`;
    selectClassCardContainer.appendChild(card);

    card.addEventListener("click", async () => {
      fadeOutEffect(selectClassPopup);
      localUserData.userData = user;
      localUserData.userData.class = `${semesterNum}${division}`;
      initClass();
    });
  }

  await hideSectionLoader();
  fadeInEffect(selectClassPopup);
}

selectClassPopupCloseButton.addEventListener("click", async () => {
  await showSectionLoader("Loading...", false);
  await toggleFormState(false);
  hideElement(loginSection);
  hideElement(selectClassPopup);
  await signOutUser();
});
export let isNewUser = { flag: false };
export async function showSectionLoader(
  message = "Loading...",
  isBlur = true,
  duration = 200,
) {
  if (!isBlur) {
    sectionLoader.classList.remove("bg-[#00000080]", "backdrop-blur-xs");
    sectionLoader.classList.add("bg-surface");
  } else {
    sectionLoader.classList.remove("bg-surface");
    sectionLoader.classList.add("bg-[#00000080]", "backdrop-blur-xs");
  }
  sectionLoader.style.transitionDuration = `${duration}ms`;
  sectionLoaderMessage.textContent = message;
  await fadeInEffect(sectionLoader);
}
export async function hideSectionLoader(duration = 200) {
  sectionLoader.style.transitionDuration = `${duration}ms`;
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
    showSectionLoader("Loading...", false);
    onAuthStateChanged(auth, async (userCredential) => {
      if (isNewUser.flag) return;
      try {
        if (userCredential) {
          const user = await getUserData(userCredential.uid);
          console.log(user);
          if (user.role === "teacher") {
            showSelectClassPopup(user);
            return;
          }
          if (user.role === "admin") {
            showSectionLoader("Loading...", false, 200);
            localUserData.userData = user;
            initAdminRouting(user);
            resetForm();
            return;
          }
          localUserData.userData = user;
          hideSectionLoader();
          initClass();
        } else {
          await hideSectionLoader();
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
export async function initClass() {
  fadeInEffect(lottieLoadingScreen);
  const userPfp = document.querySelectorAll(".user-pfp");
  userPfp.forEach((pfp) => {
    pfp.src = localUserData.userData.pfpLink;
  });
  const [Semester, Division] = localUserData.userData.class.split("");
  await initAppState(localUserData.userData, Semester, Division);
  await fadeInEffect(lottieLoadingScreen);
  if (
    localUserData.userData.role === "admin" ||
    localUserData.userData.role === "teacher"
  )
    showElement(editModeToggleButton);
  else hideElement(editModeToggleButton);
  await hideSections();
  await loadContent();
  await applyEditModeUI();
  resetForm();
  initRouting();
}
export async function initRouting() {
  const params = new URLSearchParams(window.location.search);
  const dashboard = params.get("dashboard");
  const activeSubject = params.get("subject");
  const leaderboard = params.get("leaderboard");
  const tests = params.get("tests");
  const pyq = params.get("pyq");
  const sessions = params.get("sessions");
  if (window.location.href.includes("login")) {
    await hideSections(false, false, false, false);
    showLoginSection();
  } else if (dashboard) {
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
    history.pushState({}, "", "/?dashboard=''");
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
  const adminBtnWrapper = document.querySelector(".admin-btn-wrapper");
  hideElement(adminBtnWrapper);
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
  if (localUserData.userData === undefined) initRouting();
  else if (
    localUserData.userData.role &&
    localUserData.userData.role === "admin" &&
    !localUserData.userData.isVisitingClass
  ) {
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
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline.");
  },
});
