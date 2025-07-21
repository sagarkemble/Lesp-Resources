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
};
export async function initAppState() {
  // signOutUser();
  appState.userData = await getUserData();
  // if (appState.userData.role === "admin")
  //   window.location.href = "./html/admin.html";
  // return;
  appState.activeSem = appState.userData.sem;
  appState.activeDiv = appState.userData.div;
  appState.globalData = await getGlobalData();
  appState.semesterGlobalData = await getSemesterGlobalData();
  appState.divisionData = await getDivivsionData();
  appState.subjectData = appState.divisionData.subjects;
}
function getUserData() {
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

// function watchDivisionData() {
//   onValue(
//     ref(db, `semesters/${appState.activeSem}/divisions/${appState.activeDiv}`),
//     (snapshot) => {
//       const data = snapshot.val();
//       appState.divisionData = data;
//       appState.subjectData
//       console.log("division data changed", appState.divisionData);
//     }
//   );
// }
// function watchSemesterGlobalData() {
//   onValue(
//     ref(db, `semesters/${appState.activeSem}/semesterGlobal`),
//     (snapshot) => {
//       const data = snapshot.val();
//       appState.semesterGlobalData = data;
//       console.log("semester global data changed", appState.semesterGlobalData);
//     }
//   );
// }
// function watchGlobalData() {
//   onValue(ref(db, `globalData`), (snapshot) => {
//     const data = snapshot.val();
//     appState.globalData = data;
//     console.log("global data changed", appState.globalData);
//   });
// }

function signOutUser() {
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
export async function loadSubjectSection() {
  await syncDbData();
}
