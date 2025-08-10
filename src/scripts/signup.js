import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
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
const db = getDatabase(app);

const loadingScreen = document.querySelector(".loading-screen");
const errorScreen = document.querySelector(".error-screen");
const notFoundMessage = errorScreen.querySelector(".page-not-found-content");
const wentWrongMessage = errorScreen.querySelector(".went-wrong-content");
window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const encrypted = params.get("data");
  let isValid = false;
  if (encrypted) {
    const result = decryptLink(encrypted);
    if (result) {
      console.log("Decrypted division:", result.division);
      console.log("Decrypted semester:", result.semester);
      console.log("Decrypted role:", result.role);
      userObj.division = result.division;
      userObj.semester = Number(result.semester.replace("semester", "").trim()); ///change the semester eto the
      console.log(userObj.semester);

      userObj.role = result.role;
      if (result.role === "teacher") {
        hideElement(rollNoInputWrapper);
        hideElement(finalRollNoWrapper);
      }
      isValid = true;
      await preloadIntroImages();
      await fadeOutEffect(loadingScreen);
      await fadeInEffect(introSection);
    } else {
      hideElement(wentWrongMessage);
      showElement(notFoundMessage);
      await fadeOutEffect(loadingScreen);
      await fadeInEffect(errorScreen);
      console.error("Decryption failed or data is invalid.");
      return;
    }
  } else {
    hideElement(wentWrongMessage);
    showElement(notFoundMessage);
    await fadeOutEffect(loadingScreen);
    await fadeInEffect(errorScreen);
    console.error("No data parameter found in the URL.");
    return;
  }
});
function decryptLink(dataStr) {
  try {
    const decoded = atob(dataStr);
    const original = decoded.split("").reverse().join("");
    return JSON.parse(original);
  } catch (e) {
    console.error("Failed to decode data:", e);
    return null;
  }
}
async function preloadIntroImages() {
  const images = [
    document.querySelector(".intro-img-1"),
    document.querySelector(".intro-img-2"),
    document.querySelector(".intro-img-3"),
    document.querySelector(".intro-img-4"),
  ];
  await Promise.all(
    images.map((img) => {
      if (!img) return Promise.resolve();
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve);
        img.addEventListener("error", resolve);
      });
    }),
  );
}
const introSection = document.querySelector(".intro-section");
const intro1 = document.querySelector(".intro-1");
const intro2 = document.querySelector(".intro-2");
const intro3 = document.querySelector(".intro-3");
const intro4 = document.querySelector(".intro-4");
const intro1NextBtn = document.querySelector("#intro-1-next-btn");
const intro2NextBtn = document.querySelector("#intro-2-next-btn");
const intro3NextBtn = document.querySelector("#intro-3-next-btn");
const intro4NextBtn = document.querySelector("#intro-4-next-btn");
const intro2PrevBtn = document.querySelector("#intro-2-prev-btn");
const intro3PrevBtn = document.querySelector("#intro-3-prev-btn");
const intro4PrevBtn = document.querySelector("#intro-4-prev-btn");
intro1NextBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro1);
  await fadeInEffect(intro2);
});
intro2NextBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro2);
  await fadeInEffect(intro3);
});
intro3NextBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro3);
  await fadeInEffect(intro4);
});
intro4NextBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro4);
  await fadeInEffect(studentDetailsSection);
});
intro2PrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro2);
  await fadeInEffect(intro1);
});
intro3PrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro3);
  await fadeInEffect(intro2);
});
intro4PrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(intro4);
  await fadeInEffect(intro3);
});
let userObj = {
  firstName: "",
  lastName: "",
  rollNumber: "",
  email: "",
  pfpLink: "",
  semester: "1",
  division: "a",
  theme: "default",
  userId: "",
  medalList: {
    gold: "",
    silver: "",
    bronze: "",
  },
};
// student details form
const studentDetailsSection = document.querySelector(
  ".student-details-section",
);
const studentDetailsForm = document.querySelector("#student-details-form");
const studentDetailNextBtn = studentDetailsForm.querySelector(".next-btn");
const studentDetailNextBtnLoader =
  studentDetailNextBtn.querySelector(".btn-loader");
const studentDetailNextBtnText = studentDetailNextBtn.querySelector(".text");
const firstNameInput = studentDetailsForm.querySelector("#first-name-input");
const lastNameInput = studentDetailsForm.querySelector("#last-name-input");
const rollNoInputWrapper = studentDetailsForm.querySelector(
  ".roll-no-input-wrapper",
);
const rollNoInput = studentDetailsForm.querySelector("#roll-no-input");
const firstNameError = studentDetailsForm.querySelector(
  ".first-name-related-error",
);
const lastNameError = studentDetailsForm.querySelector(
  ".last-name-related-error",
);
const rollNoError = studentDetailsForm.querySelector(".roll-no-related-error");
rollNoInput.addEventListener("input", (e) => {
  if (e.target.value.length > 6) {
    rollNoError.textContent = "Roll no must be 6 characters";
    e.target.value = e.target.value.slice(0, 6);
    showElement(rollNoError);
  } else if (e.target.value.length < 6) {
    rollNoError.textContent = "";
    hideElement(rollNoError);
  }
});
studentDetailsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideElement(firstNameError);
  hideElement(lastNameError);
  hideElement(rollNoError);
  console.log(userObj);
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const rollNoStr = rollNoInput.value.trim();
  const rollNo = Number(rollNoStr);
  let isError = false;
  if (!firstName) {
    console.log("error");
    firstNameError.textContent = "First Name is required";
    showElement(firstNameError);
    isError = true;
  }
  if (!lastName) {
    lastNameError.textContent = "Last Name is required";
    showElement(lastNameError);
    isError = true;
  }
  if (!rollNoStr && userObj.role !== "teacher") {
    rollNoError.textContent = "Roll No is required";
    showElement(rollNoError);
    isError = true;
  }
  if (isError) return;
  if (rollNoStr.length < 6 && userObj.role !== "teacher") {
    rollNoError.textContent = "Roll No must be at least 6 characters";
    showElement(rollNoError);
    isError = true;
  }
  if (isError) return;
  if (rollNoStr && userObj.role !== "teacher") {
    studentDetailNextBtn.disabled = true;
    await fadeOutEffectOpacity(studentDetailNextBtnText);
    fadeInEffect(studentDetailNextBtnLoader);
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollNo),
    );
    await get(q)
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          rollNoError.textContent = "Roll No already exists";
          showElement(rollNoError);
          isError = true;
        }
      })
      .catch((error) => {
        fadeOutEffect(errorScreen);
        console.error("Error checking roll number:", error);
        isError = true;
      });
  }
  if (isError) {
    await fadeOutEffect(studentDetailNextBtnLoader);
    await fadeInEffectOpacity(studentDetailNextBtnText);
    studentDetailNextBtn.disabled = false;
    return;
  } else {
    await fadeOutEffect(studentDetailNextBtnLoader);
    await fadeInEffectOpacity(studentDetailNextBtnText);
    userObj.firstName = firstName;
    userObj.lastName = lastName;
    userObj.rollNumber = rollNo;
    if (userObj.role === "teacher") {
      userObj.rollNumber = null;
      userObj.medalList = null;
    }
    await fadeOutEffect(studentDetailsSection);
    fadeInEffect(studentCredentialsSection);
    studentDetailNextBtn.disabled = false;
  }
});
// students credentials
const studentCredentialsSection = document.querySelector(
  ".student-credentials-section",
);
const studentCredentialsForm = document.querySelector(
  "#student-credentials-form",
);
const studentCredentialsPrevBtn =
  studentCredentialsForm.querySelector(".prev-btn");
const studentCredentialNextBtn =
  studentCredentialsForm.querySelector(".next-btn");
const studentCredentialNextBtnLoader =
  studentCredentialNextBtn.querySelector(".btn-loader");
const studentCredentialNextBtnText =
  studentCredentialNextBtn.querySelector(".text");
const emailInput = studentCredentialsForm.querySelector("#email-input");
const passwordInput = studentCredentialsForm.querySelector("#password-input");
const confirmPasswordInput = studentCredentialsForm.querySelector(
  "#confirm-password-input",
);
const emailError = studentCredentialsForm.querySelector(".email-related-error");
const passwordError = studentCredentialsForm.querySelector(
  ".password-related-error",
);
const confirmPasswordError = studentCredentialsForm.querySelector(
  ".confirm-password-related-error",
);
studentCredentialsPrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(studentCredentialsSection);
  fadeInEffect(studentDetailsSection);
  hideElement(emailError);
  hideElement(passwordError);
  hideElement(confirmPasswordError);
});
studentCredentialsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideElement(emailError);
  hideElement(passwordError);
  hideElement(confirmPasswordError);
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  let isError = false;
  if (!email) {
    emailError.textContent = "Email is required";
    showElement(emailError);
    isError = true;
  }
  if (!password) {
    passwordError.textContent = "Password is required";
    showElement(passwordError);
    isError = true;
  }
  if (!confirmPassword) {
    confirmPasswordError.textContent = "Confirm Password is required";
    showElement(confirmPasswordError);
    isError = true;
  }
  if (isError) return;
  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    showElement(passwordError);
    isError = true;
  }
  if (email && !email.includes("@gmail.com")) {
    emailError.textContent = "Enter a valid email";
    showElement(emailError);
    isError = true;
  }
  if (password !== confirmPassword) {
    confirmPasswordError.textContent = "Passwords do not match";
    showElement(confirmPasswordError);
    isError = true;
  }
  if (isError) return;
  studentCredentialNextBtn.disabled = true;
  studentCredentialsPrevBtn.disabled = true;
  await fadeOutEffectOpacity(studentCredentialNextBtnText);
  fadeInEffect(studentCredentialNextBtnLoader);
  const q = query(ref(db, "userData"), orderByChild("email"), equalTo(email));
  await get(q)
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        emailError.textContent = "Email already exists";
        showElement(emailError);
        isError = true;
      }
    })
    .catch((error) => {
      console.error("Error checking email:", error);
    });

  if (isError) {
    await fadeOutEffect(studentCredentialNextBtnLoader);
    await fadeInEffectOpacity(studentCredentialNextBtnText);
    studentCredentialNextBtn.disabled = false;
    studentCredentialsPrevBtn.disabled = false;
    return;
  } else {
    await fadeOutEffect(studentCredentialNextBtnLoader);
    await fadeInEffectOpacity(studentCredentialNextBtnText);
    userObj.email = email;
    await fadeOutEffect(studentCredentialsSection);
    fadeInEffect(pfpSelectionSection);
  }
  studentCredentialNextBtn.disabled = false;
  studentCredentialsPrevBtn.disabled = false;
});

//pfp selection section
const pfpSelectionSection = document.querySelector(".pfp-selection-section");
const pfpSelectionForm = document.querySelector("#pfp-selection-form");
const pfpSelectionPrevBtn = pfpSelectionForm.querySelector(".prev-btn");
const pfpSelectionNextBtn = pfpSelectionForm.querySelector(".next-btn");
const selectedPfpWrapper = pfpSelectionForm.querySelector(
  ".selected-pfp-wrapper",
);
const selectedPfp = pfpSelectionForm.querySelector(".selected-pfp-wrapper img");
const pfpContainer = pfpSelectionForm.querySelector(".pfp-container");
const malePfpArr = [];
const femalePfpArr = [];
const commonPfpArr = [];
const malePfpToggleBtn = pfpSelectionForm.querySelector(".male-pfp-toggle-btn");
const femalePfpToggleBtn = pfpSelectionForm.querySelector(
  ".female-pfp-toggle-btn",
);
femalePfpToggleBtn.addEventListener("click", async () => {
  femalePfpToggleBtn.classList.add("bg-surface-3");
  malePfpToggleBtn.classList.remove("bg-surface-3");
  if (
    femalePfpArr[0].classList.contains("hidden") &&
    pfpContainer.scrollTop === 0
  ) {
    await fadeOutEffectOpacity(pfpContainer);
    malePfpArr.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    femalePfpArr.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    await fadeInEffectOpacity(pfpContainer);
  } else if (
    femalePfpArr[0].classList.contains("hidden") &&
    pfpContainer.scrollTop > 0
  ) {
    malePfpArr.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    femalePfpArr.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
malePfpToggleBtn.addEventListener("click", async () => {
  malePfpToggleBtn.classList.add("bg-surface-3");
  femalePfpToggleBtn.classList.remove("bg-surface-3");
  if (
    malePfpArr[0].classList.contains("hidden") &&
    pfpContainer.scrollTop === 0
  ) {
    await fadeOutEffectOpacity(pfpContainer);
    malePfpArr.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    femalePfpArr.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    await fadeInEffectOpacity(pfpContainer);
  } else if (
    malePfpArr[0].classList.contains("hidden") &&
    pfpContainer.scrollTop > 0
  ) {
    malePfpArr.forEach((pfp) => {
      pfp.classList.remove("hidden");
    });
    femalePfpArr.forEach((pfp) => {
      pfp.classList.add("hidden");
    });
    pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
pfpContainer.addEventListener("click", async (e) => {
  const target = e.target;
  if (target.classList.contains("pfp")) {
    await fadeOutEffectOpacity(selectedPfpWrapper);
    selectedPfp.src = target.getAttribute("src");
    await fadeInEffectOpacity(selectedPfpWrapper);
    console.log("Selected PFP:", selectedPfp);
  }
});
pfpSelectionPrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(pfpSelectionSection);
  await fadeInEffect(studentCredentialsSection);
});
pfpSelectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  userObj.pfpLink = selectedPfp.src;
  await fadeOutEffect(pfpSelectionSection);
  initSummaryForm();
  await fadeInEffect(summarySection);
});

//summary form
const summarySection = document.querySelector(".summary-section");
const summaryForm = document.querySelector("#summary-form");
const summaryPrevBtn = summaryForm.querySelector(".prev-btn");
const summaryNextBtn = summaryForm.querySelector(".next-btn");
const summaryNextBtnLoader = summaryNextBtn.querySelector(".btn-loader");
const summaryNextBtnText = summaryNextBtn.querySelector(".text");
const finalName = summaryForm.querySelector("#final-name");
const finalPfp = summaryForm.querySelector("#final-pfp");
const finalRollNoWrapper = summaryForm.querySelector(".final-roll-no-wrapper");
const finalRollNo = summaryForm.querySelector("#final-roll-no");
const finalEmail = summaryForm.querySelector("#final-email");
const finalSem = summaryForm.querySelector("#final-sem");
const finalDiv = summaryForm.querySelector("#final-div");
function initSummaryForm() {
  const userFullName = `${
    userObj.firstName.charAt(0).toUpperCase() + userObj.firstName.slice(1)
  } ${userObj.lastName.charAt(0).toUpperCase() + userObj.lastName.slice(1)}`;
  finalName.textContent = userFullName;
  finalPfp.src = userObj.pfpLink;
  finalRollNo.textContent = userObj.rollNumber;
  finalEmail.textContent = userObj.email;
  finalSem.textContent = userObj.semester;
  finalDiv.textContent = userObj.division;
}
summaryPrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(summarySection);
  await fadeInEffect(pfpSelectionSection);
});
summaryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  summaryNextBtn.disabled = true;
  summaryPrevBtn.disabled = true;
  await fadeOutEffectOpacity(summaryNextBtnText);
  fadeInEffect(summaryNextBtnLoader);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userObj.email,
      passwordInput.value,
    );
    const user = userCredential.user;
    userObj.userId = user.uid;
    await writeUserData();
    await fadeOutEffect(summaryNextBtnLoader);
    await fadeInEffectOpacity(summaryNextBtnText);
    await fadeOutEffect(summarySection);
    await fadeInEffect(successScreen);
    try {
      await signOut(auth);
      console.log("Signed out successfully.");
      successLottiePlayer.play();
    } catch (signOutError) {
      console.error("Sign-out error:", signOutError);
      hideElement(notFoundMessage);
      showElement(wentWrongMessage);
      await fadeOutEffect(summarySection);
      fadeInEffect(errorScreen);
    }
  } catch (creationError) {
    console.error("Account creation error:", creationError.message);
    hideElement(notFoundMessage);
    showElement(wentWrongMessage);
    await fadeOutEffect(summarySection);
    fadeInEffect(errorScreen);
  }
  summaryNextBtn.disabled = false;
  summaryPrevBtn.disabled = false;
});

async function writeUserData() {
  const path = ref(db, `userData/${userObj.userId}`);
  return await set(path, userObj)
    .then(() => {
      console.log("User data written successfully");
    })
    .catch((error) => {
      console.error("Error writing user data:", error);
    });
}
async function fadeInEffect(element) {
  if (!element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  element.classList.remove("hidden");
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
async function fadeOutEffect(element) {
  if (element.classList.contains("hidden")) {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  if (durationStr === "0s") {
    element.classList.add("hidden");
    return;
  }
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
  element.classList.add("hidden");
}
async function fadeInEffectOpacity(element) {
  if (element.style.opacity !== "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
async function fadeOutEffectOpacity(element) {
  if (element.style.opacity === "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms = 0;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
const commonPfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common1.png?updatedAt=1750989714229",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common2.png?updatedAt=1750989746594",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common3.png?updatedAt=1750989769389",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common4.png?updatedAt=1750989791774",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common5.png?updatedAt=1750989812741",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common6.png?updatedAt=1750989835055",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common7.png?updatedAt=1750989856256",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common8.png?updatedAt=1750989922545",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common9.png?updatedAt=1750989987579",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common10.png?updatedAt=1754488069052",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common11.png?updatedAt=1750990104064",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common12.png?updatedAt=1754488104331",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common13.png?updatedAt=1754488134200",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common14.png?updatedAt=1754488170782",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common15.png?updatedAt=1750990290674",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common16.png?updatedAt=1750990316007",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common17.png?updatedAt=1750990336686",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common18.png?updatedAt=1750990574329",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common19.png?updatedAt=1750990606205",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common20.png?updatedAt=1750990650693",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common21.png?updatedAt=1750990678213",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common22.png?updatedAt=1750990720617",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common23.png?updatedAt=1750990757375",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common24.png?updatedAt=1750990926599",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common25.png?updatedAt=1750990947100",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common26.png?updatedAt=1750990969616",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common27.png?updatedAt=1750990993644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common28.png?updatedAt=1750991058183",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common29.png?updatedAt=1750991084207",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common30.png?updatedAt=1750991116272",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common31.png?updatedAt=1750991178084",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common32.png?updatedAt=1750991202197",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common33.png?updatedAt=1750991253103",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common35.png?updatedAt=1750991376907",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common39.png?updatedAt=1750991513750",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common40.png?updatedAt=1750991495674",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common41.png?updatedAt=1750991515017",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common42.png?updatedAt=1750991566588",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common43.png?updatedAt=1750991539205",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common44.png?updatedAt=1750991595732",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common47.png?updatedAt=1750989720802",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common48.png?updatedAt=1750989740868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common49.png?updatedAt=1750989765740",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common50.png?updatedAt=1754488258782",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common51.png?updatedAt=1750989834410",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common52.png?updatedAt=1750989867208",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common53.png?updatedAt=1750989970626",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common54.png?updatedAt=1750990090315",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common55.png?updatedAt=1750990148683",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common56.png?updatedAt=1750990179021",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common57.png?updatedAt=1750990203764",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common58.png?updatedAt=1750990230887",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common74.png?updatedAt=1750991061413",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common76.png?updatedAt=1750991086663",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common77.png?updatedAt=1750991171987",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common78.png?updatedAt=1750991194154",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common83.png?updatedAt=1750991402045",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common84.png?updatedAt=1750991424067",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common85.png?updatedAt=1751691972156",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common87.png?updatedAt=1751692010049",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common88.png?updatedAt=1751692029519",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common89.png?updatedAt=1754467541380",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common90.png?updatedAt=1754467650852",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common91.png?updatedAt=1754467650911",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common92.png?updatedAt=1754467848004",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common93.png?updatedAt=1754467848060",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common94.png?updatedAt=1754467848065",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common95.png?updatedAt=1754467848630",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common96.png?updatedAt=1754467848292",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common97.png?updatedAt=1754467848392",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common98.png?updatedAt=1754467848030",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common99.png?updatedAt=1754468078121",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common101.png?updatedAt=1754468078341",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common102.png?updatedAt=1754468078344",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common103.png?updatedAt=1754468078366",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common104.png?updatedAt=1754468078425",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common105.png?updatedAt=1754468078390",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common106.png?updatedAt=1754468078384",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common107.png?updatedAt=1754468316299",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common108.png?updatedAt=1754468316034",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common109.png?updatedAt=1754468316600",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common110.png?updatedAt=1754468316531",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common111.png?updatedAt=1754468316582",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common112.png?updatedAt=1754468316178",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common113.png?updatedAt=1754468393969",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common114.png?updatedAt=1754468393999",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common115.png?updatedAt=1754468393944",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common116.png?updatedAt=1754488380756",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common117.png?updatedAt=1754488403160",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common118.png?updatedAt=1754488423578",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common119.png?updatedAt=1754488445212",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common120.png?updatedAt=1754488476474",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common121.png?updatedAt=1754488493724",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common122.png?updatedAt=1754488518680",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common123.png?updatedAt=1754488536292",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common124.png?updatedAt=1754488559417",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common125.png?updatedAt=1754488580921",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common126.png?updatedAt=1754488598838",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common127.png?updatedAt=1754488616690",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common128.png?updatedAt=1754488632742",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common129.png?updatedAt=1754488651038",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common130.png?updatedAt=1754488676553",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common131.png?updatedAt=1754488695894",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common132.png?updatedAt=1754488741181",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common133.png?updatedAt=1754488769460",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common134.png?updatedAt=1754488789521",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common135.png?updatedAt=1754488821795",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common136.png?updatedAt=1754488841569",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common137.png?updatedAt=1754488859783",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common138.png?updatedAt=1754488883073",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common139.png?updatedAt=1754488903392",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common140.png?updatedAt=1754488923124",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common141.png?updatedAt=1754488941028",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common142.png?updatedAt=1754488963350",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common145.png?updatedAt=1754489019575",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common146.png?updatedAt=1754489035374",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common147.png?updatedAt=1754489056973",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common148.png?updatedAt=1754489069974",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common149.png?updatedAt=1754489083654",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common150.png?updatedAt=1754489104143",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common151.png?updatedAt=1754489120469",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common152.png?updatedAt=1754491995646",
];
const malePfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png?updatedAt=1750950918398",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m2.png?updatedAt=1750950979632",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m3.png?updatedAt=1750951038899",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m4.png?updatedAt=1750951073482",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m5.png?updatedAt=1750951106853",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m7.png?updatedAt=1750951173704",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m9.png?updatedAt=1750951225291",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m10.png?updatedAt=1750951251957",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m11.png?updatedAt=1750951276570",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m12.png?updatedAt=1750951301644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m14.png?updatedAt=1750951353530",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m15.png?updatedAt=1750951380623",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m16.png?updatedAt=1750951403575",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m17.png?updatedAt=1750951428471",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m18.png?updatedAt=1750951454124",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m20.png?updatedAt=1750951502472",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m21.png?updatedAt=1750951531803",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m22.png?updatedAt=1750951561691",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m23.png?updatedAt=1750951586826",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m24.png?updatedAt=1750951617335",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m25.png?updatedAt=1750951653269",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m26.png?updatedAt=1750951680646",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m27.png?updatedAt=1750951703535",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m29.png?updatedAt=1750951760509",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m30.png?updatedAt=1750952044454",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m33.png?updatedAt=1750952264914",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m34.png?updatedAt=1750952291682",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m35.png?updatedAt=1750952320756",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m36.png?updatedAt=1750952344911",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m37.png?updatedAt=1750952367758",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m39.png?updatedAt=1750952424973",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m41.png?updatedAt=1750952471413",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/m48.png?updatedAt=1754471409721",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/m49.png?updatedAt=1754471408893",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/m50.png?updatedAt=1754471407992",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m51.png?updatedAt=1750952706527",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m52.png?updatedAt=1750952729005",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m54.png?updatedAt=1751608964260",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m55.png?updatedAt=1754465141206",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m56.png?updatedAt=1754465192634",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m57.png?updatedAt=1754465192971",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m58.png?updatedAt=1754465254732",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m59.png?updatedAt=1754465254212",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m60.png?updatedAt=1754465254248",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m61.png?updatedAt=1754465348209",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m62.png?updatedAt=1754465348226",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m63png?updatedAt=1754465348235",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m64.png?updatedAt=1754465387379",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m65.png?updatedAt=1754465415021",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m66.png?updatedAt=1754465467679",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m67.png?updatedAt=1754465467505",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m68.png?updatedAt=1754465541748",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m69.png?updatedAt=1754465542188",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m70.png?updatedAt=1754465630417",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m71.png?updatedAt=1754465630570",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m72.png?updatedAt=1754465838862",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m73.png?updatedAt=1754465630574",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m74.png?updatedAt=1754465670724",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m75.png?updatedAt=1754465704536",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m76.png?updatedAt=1754465870549",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m77.png?updatedAt=1754465882136",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m78.png?updatedAt=1754465896029",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m79.png?updatedAt=1754466054489",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m80.png?updatedAt=1754466054464",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m81.png?updatedAt=1754466054464",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m82.png?updatedAt=1754466184806",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m83.png?updatedAt=1754466184458",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m84.png?updatedAt=1754466184457",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m85.png?updatedAt=1754466184493",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m86.png?updatedAt=1754466391851",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m87.png?updatedAt=1754466391878",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m88.png?updatedAt=1754466391794",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m89.png?updatedAt=1754466391734",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m90.png?updatedAt=1754466392174",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m91.png?updatedAt=1754466392238",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m92.png?updatedAt=1754466392190",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m93.png?updatedAt=1754466447238",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m94.png?updatedAt=1754466705507",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m95.png?updatedAt=1754466705231",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m97.png?updatedAt=1754466705669",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m98.png?updatedAt=1754466705609",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m99.png?updatedAt=1754466705623",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m100.png?updatedAt=1754466705829",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m101.png?updatedAt=1754466789147",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m102.png?updatedAt=1754466789320",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m104.png?updatedAt=1754466869772",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m105.png?updatedAt=1754466869644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m106.png?updatedAt=1754467017138",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m107.png?updatedAt=1754467017134",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m108.png?updatedAt=1754467017082",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m109.png?updatedAt=1754467017107",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m110.png?updatedAt=1754467017511",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m111.png?updatedAt=1754467017495",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m112.png?updatedAt=1754467017599",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m113.png?updatedAt=1754477164083",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m114.png?updatedAt=1754477175793",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m115.png?updatedAt=1754477196381",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m116.png?updatedAt=1754477219454",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m117.png?updatedAt=1754477250617",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m118.png?updatedAt=1754477309010",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m119.png?updatedAt=1754477338152",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m120.png?updatedAt=1754477359558",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m121.png?updatedAt=1754477523393",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m122.png?updatedAt=1754477569845",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m123.png?updatedAt=1754477589115",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m124.png?updatedAt=1754477606657",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m125.png?updatedAt=1754477625807",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m126.png?updatedAt=1754477650037",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m127.png?updatedAt=1754477671502",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m128.png?updatedAt=1754477686573",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m129.png?updatedAt=1754477704677",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m130.png?updatedAt=1754477753982",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m131.png?updatedAt=1754477780507",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m132.png?updatedAt=1754477795795",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m133.png?updatedAt=1754477808158",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m134.png?updatedAt=1754477821959",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m135.png?updatedAt=1754477842400",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m136.png?updatedAt=1754477861039",
];
const femalePfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/Female1.png?updatedAt=1750985068005",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/Female2.png?updatedAt=1750985130615",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female3.png?updatedAt=1750985175326",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/Female4.png?updatedAt=1750985222534",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female5.png?updatedAt=1750985221016",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female6.png?updatedAt=1750985259166",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female7.png?updatedAt=1750985252177",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female8.png?updatedAt=1750985306724",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female9.png?updatedAt=1750985286792",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female10.png?updatedAt=1750985381739",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female11.png?updatedAt=1750985319601",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/femlae12.png?updatedAt=1750985347061",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female13.png?updatedAt=1750985349368",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female14.png?updatedAt=1750985461480",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female15.png?updatedAt=1750985492897",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female16.png?updatedAt=1751611194555",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female17.png?updatedAt=1750985544777",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female18.png?updatedAt=1750985570748",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female19.png?updatedAt=1750985596838",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female20.png?updatedAt=1750985630337",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female21.png?updatedAt=1750985655885",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female22.png?updatedAt=1750985683489",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female23.png?updatedAt=1750985710558",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female24.png?updatedAt=1750985759465",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female25.png?updatedAt=1750985785253",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female26.png?updatedAt=1750985859516",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female27.png?updatedAt=1750985890167",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female28.png?updatedAt=1750985915376",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female29.png?updatedAt=1750985543729",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female30.png?updatedAt=1750985659668",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female31.png?updatedAt=1750985696830",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female32.png?updatedAt=1750985726429",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female33.png?updatedAt=1750985785531",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female34.png?updatedAt=1750985831050",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female35.png?updatedAt=1750985878668",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female36.png?updatedAt=1750985994506",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female37.png?updatedAt=1750986035732",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female38.png?updatedAt=1750986091014",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female39.png?updatedAt=1750986124164",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female40.png?updatedAt=1750986179788",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female41.png?updatedAt=1750986206209",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female42.png?updatedAt=1750986235782",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female43.png?updatedAt=1750986273170",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female44.png?updatedAt=1750986309794",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female45.png?updatedAt=1750986344278",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female46.png?updatedAt=1750986389186",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female47.png?updatedAt=1750986430636",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female48.png?updatedAt=1750986468092",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female49.png?updatedAt=1750986509183",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female50.png?updatedAt=1750985951139",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female51.png?updatedAt=1750985978913",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female52.png?updatedAt=1750986005585",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female53.png?updatedAt=1750986031865",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female54.png?updatedAt=1750986072773",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female55.png?updatedAt=1750986099379",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female56.png?updatedAt=1750986127313",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female57.png?updatedAt=1750986156865",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female58.png?updatedAt=1750986183312",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female59.png?updatedAt=1750986210768",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female60.png?updatedAt=1750986553939",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female61.png?updatedAt=1750986267243",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female62.png?updatedAt=1750986292238",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female63.png?updatedAt=1750986324145",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female64.png?updatedAt=1750986358644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female65.png?updatedAt=1750986383300",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female66.png?updatedAt=1750986415484",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female67.png?updatedAt=1750986439965",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female68.png?updatedAt=1750986466645",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female69.png?updatedAt=1750986495811",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female70.png?updatedAt=1750986582198",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female71.png?updatedAt=1750986607762",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female72.png?updatedAt=1750986631435",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female73.png?updatedAt=1750986655498",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female74.png?updatedAt=1750986681770",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female75.png?updatedAt=1750986704250",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female76.png?updatedAt=1750986733485",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female77.png?updatedAt=1750986770060",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female81.png?updatedAt=1750986561760",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female82.png?updatedAt=1750986588100",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female83.png?updatedAt=1750986637921",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female84.png?updatedAt=1750986662705",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female85.png?updatedAt=1750986701882",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female86.png?updatedAt=1750986732321",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female87.png?updatedAt=1750986771969",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female88.png?updatedAt=1750986799397",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female89.png?updatedAt=1750986824924",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female91.png?updatedAt=1750986897979",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female92.png?updatedAt=1750986922670",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female93.png?updatedAt=1750986946766",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female94.png?updatedAt=1750986972337",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female95.png?updatedAt=1750987027765",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female96.png?updatedAt=1750987830374",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female97.png?updatedAt=1750987654149",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female98.png?updatedAt=1750987691344",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female99.png?updatedAt=1750987720758",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female100.png?updatedAt=1750987747430",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female101.png?updatedAt=1750987013101",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female102.png?updatedAt=1750987637218",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female103.png?updatedAt=1750987062930",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female104.png?updatedAt=1750987090671",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female105.png?updatedAt=1750987117430",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female106.png?updatedAt=1750987314844",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female107.png?updatedAt=1750987206767",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female108.png?updatedAt=1750987340933",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female109.png?updatedAt=1750987364776",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female110.png?updatedAt=1750987392079",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female111.png?updatedAt=1750987422326",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female112.png?updatedAt=1750987450634",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female113.png?updatedAt=1750987492938",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female114.png?updatedAt=1750987518953",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female115.png?updatedAt=1750987546883",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female116.png?updatedAt=1750987572372",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female117.png?updatedAt=1751009226201",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female118.png?updatedAt=1750987691713",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female119.png?updatedAt=1750987720868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female120.png?updatedAt=1750987878656",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female121.png?updatedAt=1750987852910",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female122.png?updatedAt=1750987951287",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female123.png?updatedAt=1750987981257",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female124.png?updatedAt=1750988006501",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female125.png?updatedAt=1750988067759",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female126.png?updatedAt=1750988233174",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female129.png?updatedAt=1750988027543",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female130.png?updatedAt=1750988374757",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female131.png?updatedAt=1750988460112",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female132.png?updatedAt=1750988497108",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female133.png?updatedAt=1750988542633",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female134.png?updatedAt=1750988578663",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female135.png?updatedAt=1750988621908",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female136.png?updatedAt=1750988673750",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female137.png?updatedAt=1750988726514",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female138.png?updatedAt=1750988829169",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female139.png?updatedAt=1750989056364",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female140.png?updatedAt=1750987927400",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female141.png?updatedAt=1750989097753",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female142.png?updatedAt=1750989242087",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female143.png?updatedAt=1750989279286",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/feamle144.png?updatedAt=1750989308071",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female145.png?updatedAt=1750989350427",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female146.png?updatedAt=1750989380581",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female147.png?updatedAt=1750989447081",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female148.png?updatedAt=1750989529148",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female149.png?updatedAt=1750988452781",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female150.png?updatedAt=1750988480574",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female151.png?updatedAt=1750988511290",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female152.png?updatedAt=1750988534648",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female153.png?updatedAt=1750988555642",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female154.png?updatedAt=1750988581961",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female155.png?updatedAt=1750988632326",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female156.png?updatedAt=1750988657288",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female157.png?updatedAt=1750988686712",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female158.png?updatedAt=1750988721562",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female159.png?updatedAt=1750989082126",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female160.png?updatedAt=1750989163326",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female161.png?updatedAt=1750989192601",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female162.png?updatedAt=1750989214985",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female163.png?updatedAt=1750989243191",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female164.png?updatedAt=1750989269809",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female165.png?updatedAt=1750989296859",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female166.png?updatedAt=1750989331313s",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female167.png?updatedAt=1750989353334",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female168.png?updatedAt=1750989376877",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female169.png?updatedAt=1750989409254",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female170.png?updatedAt=1754468655735",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female171.png?updatedAt=1754468654608",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female172.png?updatedAt=1754468654547",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female173.png?updatedAt=1754468654667",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female174.png?updatedAt=1754487087995",
];

function renderPfpWrapper() {
  renderImage("malePfp", malePfpLinks);
  renderImage("femalePfp", femalePfpLinks);
  renderImage("commonfp", commonPfpLinks);
}
function renderImage(className, link) {
  link.forEach((element) => {
    const pfp = document.createElement("img");
    pfp.src = element;
    // pfp.loading = "lazy";
    pfp.classList.add(
      "h-full",
      "w-full",
      "pfp",
      "cursor-pointer",
      `${className}`,
    );
    if (className === "malePfp") malePfpArr.push(pfp);
    if (className === "femalePfp") {
      pfp.classList.add("hidden");
      femalePfpArr.push(pfp);
    }
    if (
      className === "commonfp" ||
      className === "memePfp" ||
      className === "cartoonPfp"
    )
      commonPfpArr.push(pfp);
    pfpContainer.appendChild(pfp);
  });
}
renderPfpWrapper();
const successScreen = document.querySelector(".success-screen");
const successLottiePlayer = document.getElementById("success-lottie-animation");
const successText = document.querySelector(".success-text");
const successWrapper = successScreen.querySelector(".success-wrapper");
successLottiePlayer.addEventListener("complete", async () => {
  console.log("Lottie animation completed");
  successWrapper.style.gap = "8px";
  await setTimeout(() => {
    successText.classList.add("show");
  }, 100);
  await setTimeout(() => {
    fadeOutEffect(successScreen);
  }, 1000);
  setTimeout(() => {
    window.location.href = "  https://0dab1116c1b7.ngrok-free.app/";
  }, 1000);
});
export function hideElement(element) {
  element.classList.add("hidden");
}
export function showElement(element) {
  element.classList.remove("hidden");
}
