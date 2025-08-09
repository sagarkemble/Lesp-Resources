import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  sendPasswordResetEmail,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  connectDatabaseEmulator,
  set,
  get,
  child,
  onValue,
  update,
  equalTo,
  remove,
  push,
  query,
  orderByChild,
} from "firebase/database";
import { getAnalytics, logEvent, setUserId } from "firebase/analytics";
import { showErrorSection } from "./error";
const firebaseConfig = {
  apiKey: "AIzaSyDM6R7E9NRG1FjBsu8v_T9QdKth0LUeLDU",
  authDomain: "lesp-resources-350d1.firebaseapp.com",
  databaseURL: "https://lesp-resources-350d1-default-rtdb.firebaseio.com",
  projectId: "lesp-resources-350d1",
  storageBucket: "lesp-resources-350d1.firebasestorage.app",
  messagingSenderId: "763683500399",
  appId: "1:763683500399:web:c3dc5d410d15416ac9b89a",
  measurementId: "G-8RSZWPT0XK",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    setUserId(analytics, user.uid);
    logEvent(analytics, "login", { method: "firebase" });
    // Just to test Analytics works at all
    logEvent(analytics, "test_event", { debug: true });

    console.log("event logged");
  }
});
const db = getDatabase(app);
// functions
export function deleteData(path) {
  return remove(ref(db, path))
    .then(() => {
      console.log("Data deleted successfully.");
    })
    .catch((error) => {
      showErrorSection();
      console.error("Error deleting data:", error);
      return;
    });
}
export function pushData(path, data) {
  return push(ref(db, path), data)
    .then(() => {
      console.log("Data pushed successfully.");
    })
    .catch((error) => {
      console.error("Error pushing data:", error);
      showErrorSection();
      return;
    });
}
export function updateData(path, data) {
  return update(ref(db, path), data)
    .then(() => {
      console.log("Data updated successfully.");
    })
    .catch((error) => {
      console.error("Error pushing data:", error);
      showErrorSection();
      return;
    });
}
export function signOutUser() {
  return signOut(auth)
    .then(() => {
      console.log("Signed out successfully.");
    })
    .catch((error) => {
      showErrorSection();
      console.error("Sign-out error:", error);
    });
}
export {
  app,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  auth,
  db,
  ref,
  set,
  get,
  push,
  onValue,
  equalTo,
  update,
  remove,
  query,
  inMemoryPersistence,
  browserLocalPersistence,
  getDatabase,
  orderByChild,
  child,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  setUserId,
  analytics,
  logEvent,
};
