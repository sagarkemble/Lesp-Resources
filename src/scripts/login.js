// loginform var and listner
import { hideSections } from "./index.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
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
  inMemoryPersistence,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
  orderByChild,
  signOut,
  query,
  getDatabase,
} from "./firebase.js";
const swiper = new Swiper("#login-section-swiper", {
  direction: "horizontal",
  loop: true,
  speed: 250,
  effect: "fade",
  autoplay: {
    delay: 2000,
  },
  fadeEffect: {
    crossFade: true,
  },
});
const loginForm = document.querySelector("#login-form");
const loginFormSection = document.querySelector(".login-form-section");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const emailRelatedError = document.querySelector("#email-related-error");
const passwordRelatedError = document.querySelector("#password-related-error");
const loginFormRelatedError = document.querySelector("#form-related-error");
const keepLoginCheckBox = document.querySelector("#keep-login-check");
const forgotPasswordLink = document.querySelector("#forgot-password-link");
const navigationWrapper = document.querySelector(".navigation-wrapper");
const header = document.querySelector("nav");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  emailRelatedError.textContent = "";
  passwordRelatedError.textContent = "";
  loginFormRelatedError.textContent = "";
  const persistenceType = keepLoginCheckBox.checked
    ? browserLocalPersistence
    : inMemoryPersistence;
  if (emailInput.value.trim() === "" || passwordInput.value.trim() === "") {
    if (emailInput.value.trim() === "") {
      emailRelatedError.textContent = "Email required";
    }
    if (passwordInput.value.trim() === "") {
      passwordRelatedError.textContent = "Password required";
    }
    return;
  }
  const email = emailInput.value;
  const password = passwordInput.value;
  setPersistence(auth, persistenceType)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(async (userCredential) => {
      console.log("User signed in:", userCredential.user);
    })
    .catch((error) => {
      console.error("Login failed:", error.message);
      if (error.code === "auth/invalid-credential") {
        loginFormRelatedError.textContent = "Invalid email or password.";
      }
    });
});

forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  showResetPasswordSection();
});
export async function showLoginSection() {
  await hideSections(false);
  await fadeInEffect(loginFormSection);
  swiper.update();
  swiper.autoplay.start();
  history.pushState({}, "", "?login");
}
export async function showResetPasswordSection() {
  await hideSections(false);
  await fadeInEffect(resetPasswordSection);
  history.pushState({}, "", "?resetPassword");
}

// reset password var and listner
const resetPasswordForm = document.querySelector("#reset-password-form");
const registeredEmailInput = document.querySelector("#registered-email-input");
const registeredEmailInputRelatedError = document.querySelector(
  "#registered-email-related-error"
);
const backToLoginPageBtn = document.querySelector(".back-to-login-btn");
backToLoginPageBtn.addEventListener("click", async () => {
  showLoginSection();
});
resetPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const registeredEmailValue = registeredEmailInput.value;
  registeredEmailInputRelatedError.textContent = "";
  if (registeredEmailValue.trim() === "") {
    registeredEmailInputRelatedError.textContent = "Email required";
    return;
  }

  sendPasswordResetEmail(auth, registeredEmailValue)
    .then(() => {
      registeredEmailInputRelatedError.textContent =
        "Reset link sent to your email.";
      registeredEmailInputRelatedError.classList.remove("text-text-error");
      registeredEmailInputRelatedError.classList.add("text-green-500");
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        registeredEmailInputRelatedError.textContent =
          "No user found with this email.";
      } else if (error.code === "auth/invalid-email") {
        registeredEmailInputRelatedError.textContent = "Invalid email address.";
      } else {
        registeredEmailInputRelatedError.textContent = "Something went wrong.";
      }
      registeredEmailInputRelatedError.classList.remove("text-green-500");
      registeredEmailInputRelatedError.classList.add("text-text-error");
    });
});
const resetPasswordSection = document.querySelector(".reset-password-section");
