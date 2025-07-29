import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { connectAuthEmulator } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { showErrorSection } from "./error";

const firebaseConfig = {
  apiKey: "AIzaSyDxg1_YR4kZ2nnZ2hm32Oyjb4CUrnlXpvQ",
  authDomain: "lesp-resources-fd879.firebaseapp.com",
  projectId: "lesp-resources-fd879",
  storageBucket: "lesp-resources-fd879.firebasestorage.app",
  messagingSenderId: "422274455357",
  appId: "1:422274455357:web:c04e0d829e7715e87ad754",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
};
