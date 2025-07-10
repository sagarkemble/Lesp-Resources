import {
  app,
  db,
  ref,
  set,
  onValue,
  getDatabase,
  get,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "./firebase.js";

// student details var
const studentDetailsSection = document.querySelector(
  "#student-details-section",
);
const studentDetailsForm = document.querySelector("#student-details-form");
const firstNameInput = document.querySelector("#first-name-input");
const firstNameInputRelatedError = document.querySelector(
  "#first-name-related-error",
);
const lastNameInput = document.querySelector("#last-name-input");
const lastNameInputRelatedError = document.querySelector(
  "#last-name-related-error",
);
const rollNumberInput = document.querySelector("#roll-no-input");
const rollNumberInputRelatedError = document.querySelector(
  "#roll-no-related-error",
);

// student credential var
const formRelatedError = document.querySelector("#form-related-error");
const studentCredentialSection = document.querySelector(
  "#student-credential-section",
);
const studentCredentialForm = document.querySelector(
  "#student-credential-form",
);
const emailInput = document.querySelector("#email-input");
const emailInputRelatedError = document.querySelector("#email-related-error");
const passwordInput = document.querySelector("#password-input");
const passwordInputRelatedError = document.querySelector(
  "#password-related-error",
);
const reEnterPasswordInput = document.querySelector("#re-enter-password-input");
const reEnterPasswordInputRelatedError = document.querySelector(
  "#re-enter-password-related-error",
);
const studentCredentialFormprevButton = document.querySelector(
  "#student-credential-form-prev-button",
);
const studentCredentialFormNextButton = document.querySelector(
  "#student-credential-form-next-button",
);

// pfp form var
const pfpSelectionSection = document.querySelector("#pfp-selection-section");
const pfpSelectionForm = document.querySelector("#pfp-selection-form");
const selectedPfp = document.querySelector("#selected-pfp");
const maleToggleButton = document.querySelector("#male-toggle-button");
const femaleToggleButton = document.querySelector("#female-toggle-button");
const pfpContainer = document.querySelector(".pfp-container");
const pfpSelectionFormNextButton = document.querySelector(
  "#pfp-selection-form-next-button",
);
const pfpSelectionFormprevButton = document.querySelector(
  "#pfp-selection-form-prev-button",
);
const femalePfpWrapper = document.querySelector(
  ".female-pfp-container-wrapper",
);
const malePfpWrapper = document.querySelector(".male-pfp-container-wrapper");
const malePfpContainer = document.querySelector("#male-pfp-container");
const femalePfpContainer = document.querySelector("#female-pfp-container");
const commonPfpContainer = document.querySelector("#common-pfp-container");
const animePfpContainer = document.querySelector("#anime-pfp-container");
const memePfpContainer = document.querySelector("#meme-pfp-container");
const cartoonPfpContainer = document.querySelector("#cartoon-pfp-container");

// summary form var
const summarySection = document.querySelector("#summary-section");
const summaryForm = document.querySelector("#summary-form");
const summaryFormPrevBtn = document.querySelector("#summary-form-prev-button");
const summaryFormNexBtn = document.querySelector("#summary-form-next-button");
const finalPfp = document.querySelector("#final-pfp");
const finalName = document.querySelector("#final-name");
const finalRollNo = document.querySelector("#final-roll-no");
const finalEmail = document.querySelector("#final-email");
const finalSem = document.querySelector("#final-sem");
const finalDiv = document.querySelector("#final-div");

// intro section
const introSection = document.querySelector(".intro-section");
const intro1 = document.querySelector(".intro-1");
const intro1NextBtn = document.querySelector("#intro-1-next-btn");
const intro2 = document.querySelector(".intro-2");
const intro2NextBtn = document.querySelector("#intro-2-next-btn");
const intro2PrevBtn = document.querySelector("#intro-2-prev-btn");
const intro3 = document.querySelector(".intro-3");
const intro3NextBtn = document.querySelector("#intro-3-next-btn");
const intro3PrevBtn = document.querySelector("#intro-3-prev-btn");
const intro4 = document.querySelector(".intro-4");
const intro4NextBtn = document.querySelector("#intro-4-next-btn");
const intro4PrevBtn = document.querySelector("#intro-4-prev-btn");
const loadingScreen = document.querySelector(".loading-screen");

const urlParams = new URLSearchParams(window.location.search);
const activeSem = urlParams.get("activesem");
const activeDiv = urlParams.get("activediv");

let studentData;
const dbRef = ref(db, "students");
onValue(dbRef, (snapshot) => {
  studentData = snapshot.val();
  console.log(studentData);
});
get(dbRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      studentData = snapshot.val();
      loadContent();
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    // window.location.href = "error.html";
    console.error(error);
  });
function loadContent() {
  setTimeout(async () => {
    await fadeOutEffect(loadingScreen);
    fadeInEffect(introSection);
  }, 200);
}
let localObj = {
  firstName: "",
  lastName: "",
  rollNo: "",
  sem: activeSem || "",
  userId: "",
  div: activeDiv || "",
  email: "",
  role: "",
  pfp: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female78.png?updatedAt=1750986797099",
};

// intro form
intro1NextBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fadeOutEffect(intro1);
  await fadeInEffect(intro2);
});
intro2NextBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fadeOutEffect(intro2);
  await fadeInEffect(intro3);
});
intro3NextBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fadeOutEffect(intro3);
  await fadeInEffect(intro4);
});
intro4NextBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fadeOutEffect(intro4);
  introSection.classList.add("hidden");

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

// student detail
studentDetailsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  firstNameInputRelatedError.textContent = "";
  lastNameInputRelatedError.textContent = "";
  rollNumberInputRelatedError.textContent = "";
  let firstNameValue = firstNameInput.value.trim();
  let lastNameValue = lastNameInput.value.trim();
  let rollNumberValue = parseInt(rollNumberInput.value.trim());
  if (firstNameValue === "" || lastNameValue === "" || rollNumberValue === "") {
    if (firstNameValue === "") {
      firstNameInput.classList.toggle("error-border");
      firstNameInputRelatedError.textContent = "First name required";
    }
    if (lastNameValue === "") {
      lastNameInput.classList.toggle("error-border");
      lastNameInputRelatedError.textContent = "Last name required";
    }
    if (isNaN(rollNumberValue)) {
      rollNumberInputRelatedError.textContent = "Roll no required";
      rollNumberInput.classList.toggle("error-border");
    }
    return;
  }
  if (String(rollNumberValue).length < 6) {
    rollNumberInputRelatedError.textContent = "Enter a valid roll no";
    return;
  }

  if (rollNumberExists(rollNumberValue)) {
    rollNumberInputRelatedError.textContent = "Roll number used";
    return;
  } else {
    localObj.firstName = firstNameValue;
    localObj.lastName = lastNameValue;
    localObj.rollNo = rollNumberValue;
    await fadeOutEffect(studentDetailsSection);
    await fadeInEffect(studentCredentialSection);
  }
});

// student credential

studentCredentialForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailInputRelatedError.textContent = "";
  passwordInputRelatedError.textContent = "";
  reEnterPasswordInputRelatedError.textContent = "";
  let emailValue = emailInput.value.trim();
  let passwordValue = passwordInput.value;
  let reEnterPasswordValue = reEnterPasswordInput.value;
  if (
    emailValue === "" ||
    passwordValue === "" ||
    reEnterPasswordValue === ""
  ) {
    if (emailValue === "") {
      emailInputRelatedError.textContent = "Email required";
    }
    if (passwordValue === "") {
      passwordInputRelatedError.textContent = "Password required";
    }
    if (reEnterPasswordValue === "") {
      reEnterPasswordInputRelatedError.textContent = "Required";
    }
    return;
  }
  if (passwordValue != reEnterPasswordValue) {
    passwordInputRelatedError.textContent = "Passwords don't match";
    reEnterPasswordInputRelatedError.textContent = "Passwords don't match";
    return;
  }
  if (passwordValue.length < 6) {
    passwordInputRelatedError.textContent = "at least 6 character needed";
    return;
  }
  if (emailExists(emailValue)) {
    emailInputRelatedError.textContent = "Email used";
    return;
  }
  localObj.email = emailValue;
  localObj.role = "student";
  await fadeOutEffect(studentCredentialSection);
  await renderPfpWrapper();
  fadeInEffect(pfpSelectionSection);
});
studentCredentialFormprevButton.addEventListener("click", async () => {
  await fadeOutEffect(studentCredentialSection);
  await fadeInEffect(studentDetailsSection);
});

// pfp section
pfpSelectionFormprevButton.addEventListener("click", async () => {
  await fadeOutEffect(pfpSelectionSection);
  await fadeInEffect(studentCredentialSection);
});

pfpContainer.addEventListener("click", async (e) => {
  if (e.target.tagName !== "IMG") return;
  await fadeOutEffect(selectedPfp);
  selectedPfp.firstElementChild.src = e.target.currentSrc;
  await new Promise((resolve) => {
    if (selectedPfp.firstElementChild.complete) {
      resolve();
    } else {
      selectedPfp.firstElementChild.onload = () => resolve();
    }
  });
  fadeInEffect(selectedPfp);
});
pfpSelectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  localObj.pfp = selectedPfp.firstElementChild.src;
  initializeSummaryVar();
  await fadeOutEffect(pfpSelectionSection);
  fadeInEffect(summarySection);
});
const malePfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png?updatedAt=1750950918398",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m2.png?updatedAt=1750950979632",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m3.png?updatedAt=1750951038899",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m4.png?updatedAt=1750951073482",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m5.png?updatedAt=1750951106853",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m7.png?updatedAt=1750951173704",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m8.png?updatedAt=1750951200204",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m9.png?updatedAt=1750951225291",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m10.png?updatedAt=1750951251957",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m11.png?updatedAt=1750951276570",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m12.png?updatedAt=1750951301644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m13.png?updatedAt=1750951325773",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m14.png?updatedAt=1750951353530",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m15.png?updatedAt=1750951380623",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m16.png?updatedAt=1750951403575",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m17.png?updatedAt=1750951428471",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m18.png?updatedAt=1750951454124",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m19.png?updatedAt=1750951478868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m20.png?updatedAt=1750951502472",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m21.png?updatedAt=1750951531803",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m22.png?updatedAt=1750951561691",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m23.png?updatedAt=1750951586826",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m24.png?updatedAt=1750951617335",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m25.png?updatedAt=1750951653269",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m26.png?updatedAt=1750951680646",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m27.png?updatedAt=1750951703535",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m28.png?updatedAt=1750951731950",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m29.png?updatedAt=1750951760509",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m30.png?updatedAt=1750952044454",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m31.png?updatedAt=1750952186802",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m33.png?updatedAt=1750952264914",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m36.png?updatedAt=1750952344911",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m34.png?updatedAt=1750952291682",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m37.png?updatedAt=1750952367758",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m38.png?updatedAt=1750952394043",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m39.png?updatedAt=1750952424973",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m40.png?updatedAt=1750952451165",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m41.png?updatedAt=1750952471413",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m42.png?updatedAt=1750952494411",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m43.png?updatedAt=1750952517135",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m44.png?updatedAt=1750952541793",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m45.png?updatedAt=1750952563394",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m46.png?updatedAt=1750952584914",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m47.png?updatedAt=1750952605773",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m48.png?updatedAt=1750952631935",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m49.png?updatedAt=1750952655261",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m50.png?updatedAt=1750952677844",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m51.png?updatedAt=1750952706527",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m52.png?updatedAt=1750952729005",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m53.png?updatedAt=1750952781028",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m32.png?updatedAt=1750993854358",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/femal16.png?updatedAt=1750985518694",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female30.png?updatedAt=1750985659668",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female78.png?updatedAt=1750986797099",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female79.png?updatedAt=1750986824621",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female81.png?updatedAt=1750986561760",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female82.png?updatedAt=1750986588100",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female83.png?updatedAt=1750986637921",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female84.png?updatedAt=1750986662705",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female85.png?updatedAt=1750986701882",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female86.png?updatedAt=1750986732321",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female87.png?updatedAt=1750986771969",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female88.png?updatedAt=1750986799397",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female89.png?updatedAt=1750986824924",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female90.png?updatedAt=1750986902798",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female91.png?updatedAt=1750986897979",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female92.png?updatedAt=1750986922670",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female93.png?updatedAt=1750986946766",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female94.png?updatedAt=1750986972337",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female95.png?updatedAt=1750987027765",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female118.png?updatedAt=1750987691713",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female119.png?updatedAt=1750987720868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female120.png?updatedAt=1750987878656",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female121.png?updatedAt=1750987852910",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female122.png?updatedAt=1750987951287",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female123.png?updatedAt=1750987981257",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female124.png?updatedAt=1750988006501",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female125.png?updatedAt=1750988067759",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female126.png?updatedAt=1750988233174",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female128.png?updatedAt=1750988000261",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female81.png?updatedAt=1750986561760",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female82.png?updatedAt=1750986588100",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female83.png?updatedAt=1750986637921",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female83.png?updatedAt=1750986637921",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female84.png?updatedAt=1750986662705",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female85.png?updatedAt=1750986701882",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female86.png?updatedAt=1750986732321",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female87.png?updatedAt=1750986771969",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female88.png?updatedAt=1750986799397",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female89.png?updatedAt=1750986824924",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female90.png?updatedAt=1750986902798",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female91.png?updatedAt=1750986897979",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female92.png?updatedAt=1750986922670",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female93.png?updatedAt=1750986946766",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female94.png?updatedAt=1750986972337",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female95.png?updatedAt=1750987027765",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female118.png?updatedAt=1750987691713",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female119.png?updatedAt=1750987720868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female120.png?updatedAt=1750987878656",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female121.png?updatedAt=1750987852910",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female122.png?updatedAt=1750987951287",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female123.png?updatedAt=1750987981257",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female124.png?updatedAt=1750988006501",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female125.png?updatedAt=1750988067759",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female126.png?updatedAt=1750988233174",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female128.png?updatedAt=1750988000261",
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
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Female/female159.png?updatedAt=1750989082126",
];
const commonPfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common1.png?updatedAt=1750989714229",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common47.png?updatedAt=1750989720802",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common2.png?updatedAt=1750989746594",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common48.png?updatedAt=1750989740868",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common3.png?updatedAt=1750989769389",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common49.png?updatedAt=1750989765740",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common4.png?updatedAt=1750989791774",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common5.png?updatedAt=1750989812741",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common6.png?updatedAt=1750989835055",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common51.png?updatedAt=1750989834410",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common7.png?updatedAt=1750989856256",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common8.png?updatedAt=1750989922545",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common52.png?updatedAt=1750989867208",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common9.png?updatedAt=1750989987579",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common53.png?updatedAt=1750989970626",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common10.png?updatedAt=1750990072693",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common11.png?updatedAt=1750990104064",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common54.png?updatedAt=1750990090315",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common55.png?updatedAt=1750990148683",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common12.png?updatedAt=1750990200246",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common56.png?updatedAt=1750990179021",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common57.png?updatedAt=1750990203764",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common13.png?updatedAt=1750990221724",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common58.png?updatedAt=1750990230887",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common14.png?updatedAt=1750990254423",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common15.png?updatedAt=1750990290674",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common59.png?updatedAt=1750990265821",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common60.png?updatedAt=1750990293738",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common16.png?updatedAt=1750990316007",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common17.png?updatedAt=1750990336686",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common61.png?updatedAt=1750990325344",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common62.png?updatedAt=1750990406813",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common63.png?updatedAt=1750990432104",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common64.png?updatedAt=1750990457815",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common18.png?updatedAt=1750990574329",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common66.png?updatedAt=1750990518459",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common65.png?updatedAt=1750990544494",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common67.png?updatedAt=1750990577236",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common19.png?updatedAt=1750990606205",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common68.png?updatedAt=1750990600414",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common69.png?updatedAt=1750990621766",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common20.png?updatedAt=1750990650693",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common70.png?updatedAt=1750990644071",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common21.png?updatedAt=1750990678213",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common22.png?updatedAt=1750990720617",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common23.png?updatedAt=1750990757375",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common24.png?updatedAt=1750990926599",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common25.png?updatedAt=1750990947100",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common26.png?updatedAt=1750990969616",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common71.png?updatedAt=1750990959914",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common27.png?updatedAt=1750990993644",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common72.png?updatedAt=1750990990592",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common73.png?updatedAt=1750991012189",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common75.png?updatedAt=1750991036911",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common28.png?updatedAt=1750991058183",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common74.png?updatedAt=1750991061413",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common29.png?updatedAt=1750991084207",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common76.png?updatedAt=1750991086663",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common30.png?updatedAt=1750991116272",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common31.png?updatedAt=1750991178084",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common77.png?updatedAt=1750991171987",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common32.png?updatedAt=1750991202197",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common78.png?updatedAt=1750991194154",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common79.png?updatedAt=1750991217085",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common33.png?updatedAt=1750991253103",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common80.png?updatedAt=1750991241768",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common34.png?updatedAt=1750991302966",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common81.png?updatedAt=1750991267121",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common82.png?updatedAt=1750991291626",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common35.png?updatedAt=1750991376907",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common36.png?updatedAt=1750991428170",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common83.png?updatedAt=1750991402045",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common84.png?updatedAt=1750991424067",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common37.png?updatedAt=1750991458276",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common38.png?updatedAt=1750991487409",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common40.png?updatedAt=1750991495674",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common39.png?updatedAt=1750991513750",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common41.png?updatedAt=1750991515017",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common43.png?updatedAt=1750991539205",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common44.png?updatedAt=1750991595732",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Common/common42.png?updatedAt=1750991566588",
];
// const animePfpLinks = [
//   "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon13.png?updatedAt=1750992200176",
//   "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon13.png?updatedAt=1750992200176",
//   "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon13.png?updatedAt=1750992200176",
//   "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon13.png?updatedAt=1750992200176",
// ];
const memePfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me23.png?updatedAt=1750954783617",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me22.png?updatedAt=1750954759484",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me21.png?updatedAt=1750954738484",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me20.png?updatedAt=1750954657169",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me19.png?updatedAt=1750954632592",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me18.png?updatedAt=1750954611563",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me17.png?updatedAt=1750954587936",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me16.png?updatedAt=1750954566711",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me15.png?updatedAt=1750954540830",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me14.png?updatedAt=1750954514979",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me13.png?updatedAt=1750954461813",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me12.png?updatedAt=1750954440191",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me11.png?updatedAt=1750954413326",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me10.png?updatedAt=1750954390676",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me9.png?updatedAt=1750954362827",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me8.png?updatedAt=1750954338997",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me7.png?updatedAt=1750954301358",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me6.png?updatedAt=1750954277797",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me5.png?updatedAt=1750954229734",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me4.png?updatedAt=1750954206878",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me3.png?updatedAt=1750954185462",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me2.png?updatedAt=1750954163478",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Memes/me1.png?updatedAt=1750954139996",
];
const cartoonPfpLinks = [
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon13.png?updatedAt=1750992200176",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon14.png?updatedAt=1750992213327",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon12.png?updatedAt=1750992148293",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon11.png?updatedAt=1750992130679",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon10.png?updatedAt=1750992116816",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon9.png?updatedAt=1750992096683",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon8.png?updatedAt=1750992082907",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon7.png?updatedAt=1750992063413",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon6.png?updatedAt=1750992043481",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon5.png?updatedAt=1750991912736",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon4.png?updatedAt=1750991864228",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon3.png?updatedAt=1750991780580",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon2.png?updatedAt=1750991794904",
  "https://ik.imagekit.io/yn9gz2n2g/Avatars/Cartoon/cartoon1.png?updatedAt=1750991715412",
];

femaleToggleButton.addEventListener("click", () => {
  maleToggleButton.classList.remove("bg-surface-3");
  femaleToggleButton.classList.add("bg-surface-3");
  if (femalePfpWrapper.classList.contains("hidden")) {
    femalePfpWrapper.classList.remove("hidden");
    malePfpWrapper.classList.add("hidden");
    pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
maleToggleButton.addEventListener("click", () => {
  femaleToggleButton.classList.remove("bg-surface-3");
  maleToggleButton.classList.add("bg-surface-3");
  if (malePfpWrapper.classList.contains("hidden")) {
    femalePfpWrapper.classList.add("hidden");
    malePfpWrapper.classList.remove("hidden");
    pfpContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});
function renderPfpWrapper() {
  renderImage(malePfpContainer, malePfpLinks);
  renderImage(femalePfpContainer, femalePfpLinks);
  renderImage(commonPfpContainer, commonPfpLinks);
  renderImage(commonPfpContainer, memePfpLinks);
  renderImage(commonPfpContainer, cartoonPfpLinks);
}
function renderImage(wrapper, link) {
  link.forEach((element) => {
    const pfp = document.createElement("img");
    pfp.src = element;
    pfp.loading = "lazy";
    pfp.classList.add("h-full", "w-full");
    wrapper.appendChild(pfp);
  });
}
renderPfpWrapper();
// summary form
summaryFormPrevBtn.addEventListener("click", async () => {
  await fadeOutEffect(summarySection);
  await fadeInEffect(pfpSelectionSection);
});
summaryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (rollNumberExists(parseInt(localObj.rollNo))) {
    await fadeOutEffect(summaryForm);
    rollNumberInputRelatedError.textContent = "Roll no used";
    fadeInEffect(studentDetailsSection);
    return;
  }
  if (emailExists(localObj.email)) {
    await fadeOutEffect(summaryForm);
    emailInputRelatedError.textContent = "Email used";
    fadeInEffect(studentCredentialSection);
    return;
  }
  await fadeOutEffect(summarySection);
  await fadeInEffect(loadingScreen);
  createAccount();
});
function initializeSummaryVar() {
  finalPfp.src = localObj.pfp;
  finalName.textContent = addedName;
  finalRollNo.textContent = localObj.rollNo;
  finalEmail.textContent = localObj.email;
  finalSem.textContent = localObj.sem;
  finalDiv.textContent = localObj.div;
}
function createAccount() {
  createUserWithEmailAndPassword(auth, localObj.email, passwordInput.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      localObj.userId = user.uid;

      signInUser();
    })
    .catch((error) => {
      console.log(error.message);
      // window.location.href = "error.html";
    });
}

function signInUser() {
  signInWithEmailAndPassword(auth, localObj.email, passwordInput.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("signed in");
      writeUserData();
    })
    .catch((error) => {
      console.log(error.message);
      // window.location.href = "error.html";
    });
}
function writeUserData() {
  const db = getDatabase();
  set(ref(db, "students/" + localObj.userId), localObj)
    .then(() => {
      window.location.href = "loggedin.html";
    })
    .catch((error) => {
      // window.location.href = "error.html";
    });
}

function rollNumberExists(inputRollNo) {
  if (!studentData) {
    return false;
  }
  for (let key in studentData) {
    const student = studentData[key];
    if (student.rollNo === inputRollNo) {
      return true;
    }
  }
  return false;
}
function emailExists(inputEmail) {
  if (!studentData) {
    return false;
  }
  for (let key in studentData) {
    const student = studentData[key];
    if (student.email === inputEmail) {
      return true;
    }
    //  else return false;
  }
  return false;
}
async function fadeInEffect(element) {
  element.classList.remove("hidden");
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fadeOutEffect(element) {
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
  element.classList.add("hidden");
}
const addedName = `${localObj.firstName} ${localObj.lastName}`;
