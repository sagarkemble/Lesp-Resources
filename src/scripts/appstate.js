import { showErrorSection } from "./error.js";
import { get, ref, db, child } from "./firebase.js";
import * as Sentry from "@sentry/browser";
export let appState = {
  userData: null,
  userId: null,
  semesterGlobalData: null,
  globalData: null,
  subjectData: null,
  divisionData: null,
  activeSe: null,
  activeDiv: null,
  isEditing: false,
  activeSubject: null,
  subjectMetaData: null,
};
export let adminAppState = {
  userData: null,
  userId: null,
  semesterData: null,
  divisionData: null,
  studentData: null,
  teacherData: null,
  activeSem: null,
  activeDiv: null,
};
export async function initAppState(userData, semester, division) {
  try {
    const globalData = await getGlobalData();
    const semesterGlobalData = await getSemesterGlobalData(semester);
    const divisionData = await getDivisionData(semester, division);
    appState.userData = userData;
    appState.userId = userData.userId;
    appState.semesterGlobalData = semesterGlobalData || {};
    appState.globalData = globalData || {};
    appState.divisionData = divisionData;
    appState.subjectData = divisionData.subjectList;
    appState.activeSem = semester;
    appState.activeDiv = division;
    appState.isEditing = false;
    appState.activeSubject = null;
    appState.activeNavIcon = null;
    appState.subjectMetaData = appState.divisionData.subjectMetaDataList;
  } catch (error) {
    showErrorSection();
    console.error("Error initializing app state:", error);
    Sentry.captureException(error);
  }
}
export function getUserData(userId) {
  return get(child(ref(db), `userData/${userId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
function getSemesterGlobalData(semester) {
  return get(child(ref(db), `semesterList/${semester}/semesterGlobalData`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
function getGlobalData() {
  return get(child(ref(db), `globalData`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
function getDivisionData(semester, division) {
  return get(
    child(ref(db), `semesterList/${semester}/divisionList/${division}`),
  )
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
export function getWholeSemesterData() {
  return get(child(ref(db), `semesterList`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}
export async function syncDbData() {
  appState.semesterGlobalData = await getSemesterGlobalData(appState.activeSem);
  appState.divisionData = await getDivisionData(
    appState.activeSem,
    appState.activeDiv,
  );
  appState.globalData = await getGlobalData();
  appState.subjectData = appState.divisionData.subjectList;
}
export async function syncAdminData() {
  adminAppState.semesterData = await getWholeSemesterData();
}
export async function loadSubjectSection() {
  await syncDbData();
}
