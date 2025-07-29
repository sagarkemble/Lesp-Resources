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
  onValue,
  signOut,
  query,
  getDatabase,
} from "./firebase.js";
export let appState = {
  userData: null,
  userId: null,
  semesterGlobalData: null,
  globalData: null,
  subjectData: null,
  divisionData: null,
  activeSem: null,
  activeDiv: null,
  isEditing: false,
  studentData: null,
  activeSubject: null,
  activeNavIcon: null,
  subjectMetaData: null,
};
export let adminAppState = {
  userData: null,
  userId: null,
  semesterData: null,
  divisionData: null,
  studentData: null,
  activeSem: null,
  activeDiv: null,
};
export async function initAppState() {
  appState.userData = await getUserData();
  // if (appState.userData.role === "admin") {
  //   adminAppState.userData = appState.userData;
  //   adminAppState.userId = appState.userId;
  //   adminAppState.semesterData = await getWholeSemesterData();
  //   console.log(adminAppState.semesterData);
  //   return;
  // }
  //   window.location.href = "./html/admin.html";
  appState.activeSem = appState.userData.sem;
  appState.activeDiv = appState.userData.div;
  appState.globalData = await getGlobalData();
  appState.semesterGlobalData = await getSemesterGlobalData();
  appState.divisionData = await getDivivsionData();
  appState.subjectData = appState.divisionData.subjects;
  appState.subjectMetaData = appState.subjectData.subjectMetaData;
}
async function initAdmin() {}
export function getUserData() {
  appState.userId = auth.currentUser.uid;
  return get(child(ref(db), `users/${appState.userId}`))
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
function getSemesterGlobalData() {
  return get(child(ref(db), `semesters/${appState.activeSem}/semesterGlobal`))
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
function getGlobalData() {
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
function getDivivsionData() {
  return get(
    child(
      ref(db),
      `semesters/${appState.activeSem}/divisions/${appState.activeDiv}`
    )
  )
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
export function getWholeSemesterData() {
  return get(child(ref(db), `semesters`))
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

export function signOutUser() {
  signOut(auth)
    .then(() => {
      console.log("Signed out successfully.");
    })
    .catch((error) => {
      console.error("Sign-out error:", error);
    });
}
export async function syncDbData() {
  appState.semesterGlobalData = await getSemesterGlobalData();
  appState.divisionData = await getDivivsionData();
  appState.globalData = await getGlobalData();
  appState.subjectData = appState.divisionData.subjects;
}
export async function syncAdminData() {
  adminAppState.semesterData = await getWholeSemesterData();
}
export async function loadSubjectSection() {
  await syncDbData();
}
