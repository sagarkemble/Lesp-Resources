import {
  app,
  signInWithEmailAndPassword,
  auth,
  get,
  equalTo,
  ref,
  db,
  child,
  onAuthStateChanged,
  orderByChild,
  signOut,
  query,
  getDatabase,
} from "./firebase.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { showDashboard, loadDashboard } from "./dashboard.js";
import { loadTestSection, showTestsSection } from "./tests.js";
import {
  navIcon,
  setActiveNavIcon,
  dashboardIcon,
  subjectIcon,
  leaderboardIcon,
  loadSubjectSelectionList,
  sessionsIcon,
  timeTabelIcon,
  testsIcon,
} from "./navigation.js";
import { loadSubjectSection } from "./subject.js";
import { showLoginSection, showResetPasswordSection } from "./login.js";
import { showSessionsSection } from "./sessions.js";
import {
  loadLeaderboardSection,
  showLeaderboardSection,
} from "./leaderboard.js";
const loadingScreen = document.querySelector(".loading-screen");
const lotteLoader = document.querySelector("#lotte-loader");
const navigationWrapper = document.querySelector(".navigation-wrapper");
const header = document.querySelector("nav");

export let userData;
export let semesterGlobalData;
export let globalData;
export let subjectData;
export let divisionData;
let activeSem;
let activeDiv;
async function getUserData(inputUid) {
  return get(child(ref(db), `users/${inputUid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());

        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
async function getSemesterGlobalData() {
  return get(child(ref(db), `semesters/${userData.sem}/semesterGlobal`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
async function getGlobalData() {
  return get(child(ref(db), `globalData`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}

async function getDivivsionData() {
  return get(
    child(ref(db), `semesters/${userData.sem}/divisions/${userData.div}`)
  )
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("division dat recived ");
        console.log(snapshot.val());
        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
async function loadContent() {
  loadSubjectSelectionList(divisionData.subjects.individualSubjects);
  loadTestSection(divisionData.test);
}
function singout() {
  signOut(auth)
    .then(() => {
      console.log("Signed out successfully.");
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
}
document.addEventListener("DOMContentLoaded", async () => {
  // singout();
  await fadeInEffect(loadingScreen);
  onAuthStateChanged(auth, async (userCredential) => {
    if (userCredential) {
      await fadeInEffect(loadingScreen);
      await hideSections();
      userData = await getUserData(userCredential.uid);
      semesterGlobalData = await getSemesterGlobalData();
      globalData = await getGlobalData();
      divisionData = await getDivivsionData();
      activeSem = userData.sem;
      activeDiv = userData.div;
      console.log(divisionData);
      await loadContent();
      initRouting();
    } else {
      await fadeOutEffect(loadingScreen);
      await showLoginSection();
    }
  });
});
export async function initRouting() {
  if (userData.role === "admin") window.location.href = "./html/admin.html";
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
    // await showDashboard();
  } else if (activeSubject) {
    await fadeOutEffect(loadingScreen);
    loadSubjectSection(
      divisionData.subjects,
      activeSubject,
      activeDiv,
      activeSem
    );
    setActiveNavIcon(subjectIcon);
  } else if (leaderboard) {
    await fadeOutEffect(loadingScreen);
    console.log("this is leaderboard route");
    setActiveNavIcon(leaderboardIcon);
    showLeaderboardSection();
  } else if (tests) {
    await fadeOutEffect(loadingScreen);
    await showTestsSection();
    setActiveNavIcon(testsIcon);
  } else if (sessions) {
    await fadeOutEffect(loadingScreen);
    await showSessionsSection();
    setActiveNavIcon(sessionsIcon);
  } else if (pyq) {
    await fadeOutEffect(loadingScreen);
    showPyq();
  } else {
    await fadeOutEffect(loadingScreen);
    console.log("hi this is init routing");
    hideSections();
    // showDashboard();
  }
}
export async function hideSections(showNavigationAndHeader = true) {
  if (showNavigationAndHeader) {
    if (
      getComputedStyle(navigationWrapper).display === "none" ||
      getComputedStyle(header).display === "none" ||
      getComputedStyle(navIcon).display === "none"
    ) {
      fadeInEffect(navigationWrapper);
      fadeInEffect(header);
      fadeInEffect(navIcon);
    }
  }

  const allSections = document.querySelectorAll("section");
  for (const section of allSections) {
    await fadeOutEffect(section);
  }
}

window.addEventListener("popstate", () => {
  initRouting();
});
