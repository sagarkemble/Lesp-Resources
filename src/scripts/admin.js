import {
  get,
  ref,
  db,
  updateData,
  query,
  orderByChild,
  equalTo,
  signOutUser,
  pushData,
  writeData,
} from "./firebase.js";
import {
  showConfirmationPopup,
  showSectionLoader,
  hideSectionLoader,
  initRouting,
  localUserData,
  initClass,
  lottieLoadingScreen,
} from "./index";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation";
import {
  adminAppState,
  appState,
  syncAdminData,
  getWholeSemesterData,
  initAppState,
} from "./appstate";
import { headerIcon, headerTitle } from "./navigation";
import { hideSections } from "./index";
const adminSection = document.querySelector(".admin-section");
let activeUserId = null;
let activeUserObj = null;
const DOM = {
  adminSection: document.querySelector(".admin-section"),
  semesterList: document.querySelector(".semester-list"),
  semCardContainer: document.querySelector(".sem-card-container"),
  divisionList: document.querySelector(".division-list"),
  divCardContainer: document.querySelector(".div-card-container"),
  classRoom: document.querySelector(".class-room"),
  studentCardContainer: document.querySelector(".student-card-container"),
  teacherCardContainer: document.querySelector(".teacher-card-container"),
  addStudentBtn: document.querySelector(".class-room .add-student-btn"),
  addTeacherBtn: document.querySelector(".class-room .add-teacher-btn"),
  logOutBtn: document.querySelector(".admin-logout-btn"),
  editBtn: document.querySelector(".edit-mode-toggle-btn"),
  visitClassRoomBtn: document.querySelector(".visit-class-room-btn"),
  adminBtnWrapper: document.querySelector(".admin-btn-wrapper"),
  addUserPopup: {
    popup: document.querySelector(".add-user-link-popup-wrapper"),
    popupTitle: document.querySelector(
      ".add-user-link-popup-wrapper .popup-title",
    ),
    link: document.querySelector("#add-user-link"),
    successBtn: document.querySelector(
      ".add-user-link-popup-wrapper .success-btn",
    ),
  },
  individualUserPopup: {
    popup: document.querySelector(".individual-user-popup-wrapper"),
    displayName: document.querySelector(
      ".individual-user-popup-wrapper .display-name",
    ),
    firstName: document.querySelector(
      ".individual-user-popup-wrapper .first-name",
    ),
    lastName: document.querySelector(
      ".individual-user-popup-wrapper .last-name",
    ),
    rollNo: document.querySelector(".individual-user-popup-wrapper .roll-no"),
    email: document.querySelector(".individual-user-popup-wrapper .email"),
    assignedClasses: document.querySelector(
      ".individual-user-popup-wrapper .assigned-classes",
    ),
    sem: document.querySelector(".individual-user-popup-wrapper .sem"),
    div: document.querySelector(".individual-user-popup-wrapper .div"),
    role: document.querySelector(".individual-user-popup-wrapper .role"),
    pfp: document.querySelector(".individual-user-popup-wrapper .pfp"),
    medalPointWrapper: document.querySelector(
      ".individual-user-popup-wrapper .medal-point-wrapper",
    ),
    medals: {
      gold: document.querySelector(
        ".individual-user-popup-wrapper .gold-medal .qty",
      ),
      silver: document.querySelector(
        ".individual-user-popup-wrapper .silver-medal .qty",
      ),
      bronze: document.querySelector(
        ".individual-user-popup-wrapper .bronze-medal .qty",
      ),
    },
    points: document.querySelector(".individual-user-popup-wrapper .points"),
    closePopupBtn: document.querySelector(
      ".individual-user-popup-wrapper .close-popup-btn",
    ),
    removeUserBtn: document.querySelector(
      ".individual-user-popup-wrapper .remove-user-btn",
    ),
  },
  pickTeacherPopup: {
    popup: document.querySelector(".pick-teacher-popup-wrapper"),
    cardContainer: document.querySelector(
      ".pick-teacher-popup-wrapper .card-container",
    ),
    closePopupBtn: document.querySelector(
      ".pick-teacher-popup-wrapper .close-popup-btn",
    ),
  },
  namePopup: {
    popup: document.querySelector(".edit-name-popup-wrapper"),
    inputs: {
      firstName: document.querySelector("#user-first-name-input"),
      lastName: document.querySelector("#user-last-name-input"),
    },
    errors: {
      firstName: document.querySelector(
        ".edit-name-popup-wrapper .first-name-error",
      ),
      lastName: document.querySelector(
        ".edit-name-popup-wrapper .last-name-error",
      ),
    },
    successBtn: document.querySelector(".edit-name-popup-wrapper .success-btn"),
    closePopupBtn: document.querySelector(
      ".edit-name-popup-wrapper .close-popup-btn",
    ),
  },
  rollNoPopup: {
    popup: document.querySelector(".edit-roll-no-popup-wrapper"),
    input: document.querySelector(".edit-roll-no-popup-wrapper .roll-no-input"),
    error: document.querySelector(".edit-roll-no-popup-wrapper .roll-no-error"),
    successBtn: document.querySelector(
      ".edit-roll-no-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-roll-no-popup-wrapper .close-popup-btn",
    ),
  },
  emailPopup: {
    popup: document.querySelector(".edit-email-popup-wrapper"),
    input: document.querySelector(".edit-email-popup-wrapper .email-input"),
    error: document.querySelector(".edit-email-popup-wrapper .email-error"),
    successBtn: document.querySelector(
      ".edit-email-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-email-popup-wrapper .close-popup-btn",
    ),
  },
  rolePopup: {
    popup: document.querySelector(".edit-role-popup-wrapper"),
    input: document.querySelector(".edit-role-popup-wrapper .role-input"),
    error: document.querySelector(".edit-role-popup-wrapper .role-error"),
    successBtn: document.querySelector(".edit-role-popup-wrapper .success-btn"),
    closePopupBtn: document.querySelector(
      ".edit-role-popup-wrapper .close-popup-btn",
    ),
  },
  semDivPopup: {
    popup: document.querySelector(".edit-sem-div-popup-wrapper"),
    inputs: {
      semester: document.querySelector(
        ".edit-sem-div-popup-wrapper .semester-input",
      ),
      division: document.querySelector(
        ".edit-sem-div-popup-wrapper .division-input",
      ),
    },
    errors: {
      semester: document.querySelector(
        ".edit-sem-div-popup-wrapper .semester-error",
      ),
      division: document.querySelector(
        ".edit-sem-div-popup-wrapper .division-error",
      ),
    },
    successBtn: document.querySelector(
      ".edit-sem-div-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-sem-div-popup-wrapper .close-popup-btn",
    ),
  },
  medalPopup: {
    inputs: {
      gold: document.querySelector(
        ".edit-medal-popup-wrapper .gold-medal-input",
      ),
      silver: document.querySelector(
        ".edit-medal-popup-wrapper .silver-medal-input",
      ),
      bronze: document.querySelector(
        ".edit-medal-popup-wrapper .bronze-medal-input",
      ),
    },
    error: document.querySelector(".edit-medal-popup-wrapper .medal-error"),
    successBtn: document.querySelector(
      ".edit-medal-popup-wrapper .success-btn",
    ),
    closePopupBtn: document.querySelector(
      ".edit-medal-popup-wrapper .close-popup-btn",
    ),
    popup: document.querySelector(".edit-medal-popup-wrapper"),
  },
};
export async function initAdminRouting(userData) {
  await showSectionLoader("Loading...", false);
  if (userData) {
    adminAppState.userData = userData;
    adminAppState.userId = userData.id;
  }
  adminAppState.semesterData = await getWholeSemesterData();
  await hideSections(true, true, false, true);
  showElement(adminSection);
  showElement(DOM.adminBtnWrapper);
  hideElement(DOM.editBtn);
  const urlParams = new URLSearchParams(window.location.search);
  const semesterList = urlParams.get("semesterList");
  const sem = urlParams.get("sem");
  const div = urlParams.get("div");
  if (div) {
    console.log("Div found");
    adminAppState.activeSem = sem;
    adminAppState.activeDiv = div;
    await showClassRoom();
  } else if (sem) {
    adminAppState.activeSem = sem;
    await showDivisionList();
  } else if (semesterList) {
    await showSemesterList();
  } else {
    await showSemesterList();
  }
}
//semester section
async function showSemesterList() {
  await showSectionLoader("Loading...", false);
  await hideAdminDivisions();
  history.pushState({}, "", `?semesterList=''`);
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = "Admin Section";
  for (const key in adminAppState.semesterData) {
    const semesterName = key;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 text-text-primary w-full rounded-3xl p-6 text-center font-semibold cursor-pointer custom-hover";
    card.textContent = `Semester - ${semesterName}`;
    card.addEventListener("click", async (e) => {
      let activeSem = e.target.textContent;
      adminAppState.activeSem = activeSem.replace("Semester - ", "");
      history.pushState(
        { sem: activeSem },
        "",
        `?sem=${encodeURIComponent(activeSem.replace("Semester - ", ""))}`,
      );
      showDivisionList();
    });
    DOM.semCardContainer.appendChild(card);
  }
  history.pushState({}, "", "?semesterList=''");
  showElement(DOM.semesterList);
  hideSectionLoader(200);
}
async function unloadSemesterList() {
  await fadeOutEffect(DOM.semesterList);
  DOM.semCardContainer.innerHTML = "";
}
//division section
async function showDivisionList() {
  showSectionLoader("Loading...", false);
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeSem;
  for (const key in adminAppState.semesterData[adminAppState.activeSem]
    .divisionList) {
    const divisionName = `Div - ${key}`;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 text-text-primary w-full rounded-3xl p-6 text-center font-semibold custom-hover cursor-pointer";
    card.textContent = divisionName;
    card.addEventListener("click", async (e) => {
      let activeDiv = e.target.textContent.replace("Div - ", "");
      adminAppState.activeDiv = activeDiv;
      history.pushState(
        { div: activeDiv },
        "",
        `admin.html?sem=${encodeURIComponent(
          adminAppState.activeSem,
        )}&div=${encodeURIComponent(activeDiv)}`,
      );
      showClassRoom();
    });
    DOM.divCardContainer.appendChild(card);
  }
  showElement(DOM.divisionList);
  hideSectionLoader(200);
}
async function unloadDivisionList() {
  await fadeOutEffect(DOM.divisionList);
  DOM.divCardContainer.innerHTML = "";
}
// class room section
async function showClassRoom() {
  showSectionLoader("Loading...", false);
  await hideAdminDivisions();
  showElement(DOM.visitClassRoomBtn);
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeDiv;
  const studentRawData = await getStudentRawData();
  let sortedRollNoWiseStudentData = {};
  let teacherData = await getTeacherData();
  console.log(teacherData);
  if (studentRawData) {
    sortedRollNoWiseStudentData = Object.entries(studentRawData)
      .sort(([, a], [, b]) => a.rollNumber - b.rollNumber)
      .reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
      }, {});
  } else {
    sortedRollNoWiseStudentData = {};
  }
  if (teacherData) {
    adminAppState.semesterData[adminAppState.activeSem].divisionList[
      adminAppState.activeDiv
    ].teacherList = teacherData;
  }
  adminAppState.semesterData[adminAppState.activeSem].divisionList[
    adminAppState.activeDiv
  ].studentList = sortedRollNoWiseStudentData;
  renderIndividualStudentCard();
  renderIndividualTeacherCard();
  renderTeacherCardInPopup();
  showElement(DOM.classRoom);
  hideSectionLoader(200);
}
async function unloadClassRoom() {
  await fadeOutEffect(DOM.classRoom);
  hideElement(DOM.visitClassRoomBtn);
  DOM.studentCardContainer.innerHTML = "";
  DOM.teacherCardContainer.innerHTML = "";
  DOM.pickTeacherPopup.cardContainer.innerHTML = "";
}
async function hideAdminDivisions() {
  await unloadSemesterList();
  await unloadDivisionList();
  await unloadClassRoom();
}
// other function
function getStudentRawData() {
  const usersRef = ref(db, "userData");
  const q = query(
    usersRef,
    orderByChild("class"),
    equalTo(`${adminAppState.activeSem}${adminAppState.activeDiv}`),
  );
  return get(q).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No users found for div:", adminAppState.activeDiv);
    }
  });
}
async function getTeacherData() {
  const usersRef = ref(db, "userData");
  const q = query(usersRef, orderByChild("role"), equalTo("teacher"));
  const snapshot = await get(q);
  adminAppState.allTeachers = snapshot.val();
  const sem = adminAppState.activeSem;
  const div = adminAppState.activeDiv;
  const matchingTeachers = [];
  for (const key in snapshot.val()) {
    const assignedClass = snapshot.val()[key].assignedClasses;
    if (assignedClass && assignedClass[`${sem}${div}`]) {
      matchingTeachers.push(snapshot.val()[key]);
    }
  }
  return matchingTeachers;
}
function renderTeacherCardInPopup() {
  for (const key in adminAppState.allTeachers) {
    const element = adminAppState.allTeachers[key];
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 items-center border border-surface-3 p-3 md:px-4 flex justify-between rounded-xl cursor-pointer";
    const wrapper = document.createElement("div");
    wrapper.className =
      "wrapper w-[12rem] md:w-[22rem] gap-1.5 md:gap-4 flex items-center justify-between";
    const namePfpWrapper = document.createElement("div");
    namePfpWrapper.className = "name-pfp-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = element.pfpLink;
    img.alt = "";
    img.className = "pfp h-10 w-10";

    const nameContainer = document.createElement("div");
    nameContainer.className =
      "flex flex-col leading-tight text-sm md:text-base";

    const firstName = document.createElement("p");
    firstName.className = "truncate w-full";
    firstName.textContent = element.firstName;

    const lastName = document.createElement("p");
    lastName.className = "truncate w-full";
    lastName.textContent = element.lastName;

    nameContainer.appendChild(firstName);
    nameContainer.appendChild(lastName);

    namePfpWrapper.appendChild(img);
    namePfpWrapper.appendChild(nameContainer);

    wrapper.appendChild(namePfpWrapper);
    card.appendChild(wrapper);

    DOM.pickTeacherPopup.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      console.log("clicked");
      addTeacherInClass(key);
    });
  }
  const wrapper = document.createElement("div");
  wrapper.className =
    "p-4 text-center border border-surface-3 rounded-xl cursor-pointer custom-hover";
  wrapper.innerHTML = "Add new teacher account";
  DOM.pickTeacherPopup.cardContainer.appendChild(wrapper);
  wrapper.addEventListener("click", () => {
    const encryptedData = encryptObj({
      division: `${adminAppState.activeDiv}`,
      semester: `${adminAppState.activeSem.replace("semester", "")}`,
      role: "teacher",
    });
    encryptedCode = encryptedData;
    DOM.addUserPopup.link.textContent = encryptedCode;
    DOM.addUserPopup.popupTitle.textContent = `Add teacher`;

    fadeInEffect(DOM.addUserPopup.popup);
  });
}
function renderIndividualStudentCard() {
  for (const key in adminAppState.semesterData[adminAppState.activeSem]
    .divisionList[adminAppState.activeDiv].studentList) {
    const student =
      adminAppState.semesterData[adminAppState.activeSem].divisionList[
        adminAppState.activeDiv
      ].studentList[key];
    const card = document.createElement("div");
    card.className =
      "individual-student-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5 cursor-pointer custom-hover";
    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-2";
    const img = document.createElement("img");
    img.src = student.pfpLink;
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";
    const nameP = document.createElement("p");
    nameP.className = "student-name";
    nameP.textContent = `${student.firstName} ${student.lastName}`;
    wrapper.appendChild(img);
    wrapper.appendChild(nameP);
    const rollP = document.createElement("p");
    rollP.className = "roll-no text-text-secondary";
    rollP.textContent = student.rollNumber;
    card.appendChild(wrapper);
    card.appendChild(rollP);
    card.addEventListener("click", () => {
      activeUserId = key;
      activeUserObj =
        adminAppState.semesterData[adminAppState.activeSem].divisionList[
          adminAppState.activeDiv
        ].studentList[key];
      initIndividualUserPopup();
    });
    DOM.studentCardContainer.appendChild(card);
  }
}
function renderIndividualTeacherCard() {
  for (const key in adminAppState.semesterData[adminAppState.activeSem]
    .divisionList[adminAppState.activeDiv].teacherList) {
    const teacher =
      adminAppState.semesterData[adminAppState.activeSem].divisionList[
        adminAppState.activeDiv
      ].teacherList[key];
    const card = document.createElement("div");
    card.className =
      "individual-teacher-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5 cursor-pointer custom-hover";
    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-2";
    const img = document.createElement("img");
    img.src = teacher.pfpLink;
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";
    const nameP = document.createElement("p");
    nameP.className = "student-name";
    nameP.textContent = `${teacher.firstName} ${teacher.lastName}`;
    wrapper.appendChild(img);
    wrapper.appendChild(nameP);
    card.appendChild(wrapper);
    card.addEventListener("click", () => {
      activeUserId = teacher.userId;
      activeUserObj = teacher;
      initIndividualUserPopup(true);
    });
    DOM.teacherCardContainer.appendChild(card);
  }
}
async function addTeacherInClass(teacherId) {
  console.log("clicked");
  const isConfirm = await showConfirmationPopup(
    "Teacher will be added will have access to the class",
  );
  if (!isConfirm) return;
  showSectionLoader("Updating data...");
  const key = `${adminAppState.activeSem.replace("semester", "")}${adminAppState.activeDiv}`;
  await updateData(`userData/${teacherId}/assignedClasses/`, {
    [key]: true,
  });
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideAdminDivisions();
  await hideSectionLoader();
  await showClassRoom();
}

//add student link
let encryptedCode = "";
DOM.addStudentBtn.addEventListener("click", () => {
  const encryptedData = encryptObj({
    division: `${adminAppState.activeDiv}`,
    semester: `${adminAppState.activeSem}`,
    role: "student",
  });
  DOM.addUserPopup.link.textContent = encryptedData;
  encryptedCode = encryptedData;
  DOM.addUserPopup.popupTitle.textContent = `Add student`;
  fadeInEffect(DOM.addUserPopup.popup);
});
DOM.addTeacherBtn.addEventListener("click", () => {
  fadeInEffect(DOM.pickTeacherPopup.popup);
});
DOM.addUserPopup.successBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.addUserPopup.popup);
});
DOM.addUserPopup.link.addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard.writeText(DOM.addUserPopup.link.textContent);
  DOM.addUserPopup.link.textContent = "Copied!";
  setTimeout(() => {
    DOM.addUserPopup.link.textContent = encryptedCode;
  }, 2000);
});
function encryptObj(obj) {
  const str = JSON.stringify(obj);
  let encoded = btoa(str);
  encoded = encoded.match(/.{1,4}/g).join("-");
  return encoded;
}

DOM.logOutBtn.addEventListener("click", signOutUser);
DOM.visitClassRoomBtn.addEventListener("click", async () => {
  fadeInEffect(lottieLoadingScreen);
  localUserData.userData = adminAppState.userData;
  localUserData.isVisitingClass = true;
  localUserData.userData.semester = Number(adminAppState.activeSem);
  localUserData.userData.division = adminAppState.activeDiv;
  initClass();
});
DOM.pickTeacherPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.pickTeacherPopup.popup);
});
// DOM.removeUserBtn.addEventListener("click", async () => {
//   const isConfirmed = await showConfirmationPopup(
//     "Are you sure you want to remove this user?",
//   );
// });

// individual student related
DOM.individualUserPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.individualUserPopup.popup);
});
function initIndividualUserPopup(isTeacher = false) {
  if (isTeacher) {
    const teacher = activeUserObj;
    let assignedClasses = Object.keys(teacher.assignedClasses).join(", ");

    DOM.individualUserPopup.firstName.innerHTML = `
  <span class="text-text-primary">First Name:</span>
  <span class="text-text-secondary">${teacher.firstName}</span>
`;

    DOM.individualUserPopup.lastName.innerHTML = `
  <span class="text-text-primary">Last Name:</span>
  <span class="text-text-secondary">${teacher.lastName}</span>
`;

    DOM.individualUserPopup.displayName.innerHTML = `${teacher.firstName} ${teacher.lastName}`;

    DOM.individualUserPopup.email.innerHTML = `
  <span class="text-text-primary">Email:</span>
  <span class="text-text-secondary break-all">${teacher.email}</span>
`;

    DOM.individualUserPopup.assignedClasses.innerHTML = `
  <span class="text-text-primary">Assigned Classes:</span>
  <span class="text-text-secondary break-all">${assignedClasses}</span>
`;

    DOM.individualUserPopup.pfp.src = teacher.pfpLink;

    showElement(DOM.individualUserPopup.assignedClasses);
    hideElement(DOM.individualUserPopup.rollNo);
    hideElement(DOM.individualUserPopup.role);
    hideElement(DOM.individualUserPopup.sem);
    hideElement(DOM.individualUserPopup.div);
    hideElement(DOM.individualUserPopup.medalPointWrapper);
  } else {
    const student = activeUserObj;
    showElement(DOM.individualUserPopup.rollNo);
    showElement(DOM.individualUserPopup.role);
    showElement(DOM.individualUserPopup.sem);
    showElement(DOM.individualUserPopup.div);
    showElement(DOM.individualUserPopup.medalPointWrapper);
    hideElement(DOM.individualUserPopup.assignedClasses);
    console.log(student);
    DOM.individualUserPopup.firstName.innerHTML = `
  <span class="text-text-primary">First Name:</span>
  <span class="text-text-secondary">${student.firstName}</span>
`;

    DOM.individualUserPopup.lastName.innerHTML = `
  <span class="text-text-primary">Last Name:</span>
  <span class="text-text-secondary">${student.lastName}</span>
`;

    DOM.individualUserPopup.displayName.innerHTML = `
  ${student.firstName} ${student.lastName}
`;

    DOM.individualUserPopup.rollNo.innerHTML = `
  <span class="text-text-primary">Roll No:</span>
  <span class="text-text-secondary">${student.rollNumber}</span>
`;

    DOM.individualUserPopup.email.innerHTML = `
  <span class="text-text-primary">Email:</span>
  <span class="text-text-secondary">${student.email}</span>
`;

    DOM.individualUserPopup.role.innerHTML = `
  <span class="text-text-primary">Role:</span>
  <span class="text-text-secondary">${student.role.charAt(0).toUpperCase()}${student.role.slice(1)}</span>
`;

    const [sem, div] = student.class.split("");
    DOM.individualUserPopup.sem.innerHTML = `
  <span class="text-text-primary">Semester:</span>
  <span class="text-text-secondary">${sem}</span>
`;
    DOM.individualUserPopup.div.innerHTML = `
  <span class="text-text-primary">Division:</span>
  <span class="text-text-secondary">${div.toUpperCase()}</span>
`;
    DOM.individualUserPopup.pfp.src = student.pfpLink;
    const gold = student.medalList.gold || 0;
    const silver = student.medalList.silver || 0;
    const bronze = student.medalList.bronze || 0;
    DOM.individualUserPopup.medals.gold.textContent = gold;
    DOM.individualUserPopup.medals.silver.textContent = silver;
    DOM.individualUserPopup.medals.bronze.textContent = bronze;
    const totalPoints = gold * 30 + silver * 20 + bronze * 10;
    DOM.individualUserPopup.points.textContent = totalPoints;
  }
  fadeInEffect(DOM.individualUserPopup.popup);
}
//first name last name
DOM.individualUserPopup.firstName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value = activeUserObj.firstName;
  DOM.namePopup.inputs.lastName.value = activeUserObj.lastName;
  fadeInEffect(DOM.namePopup.popup);
});
DOM.individualUserPopup.lastName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value = activeUserObj.firstName;
  DOM.namePopup.inputs.lastName.value = activeUserObj.lastName;
  fadeInEffect(DOM.namePopup.popup);
});
DOM.namePopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.namePopup.popup);
});
DOM.namePopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.namePopup.errors.firstName);
  fadeOutEffect(DOM.namePopup.errors.lastName);
  const firstName = DOM.namePopup.inputs.firstName.value.trim();
  const lastName = DOM.namePopup.inputs.lastName.value.trim();
  let isError = false;
  if (!firstName) {
    DOM.namePopup.errors.firstName.textContent = "First Name is required";
    fadeInEffect(DOM.namePopup.errors.firstName);
    isError = true;
  }
  if (!lastName) {
    DOM.namePopup.errors.lastName.textContent = "Last Name is required";
    fadeInEffect(DOM.namePopup.errors.lastName);
    isError = true;
  }
  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the name of the student. Are you sure?",
  );
  if (!isConfirmed) return;
  showSectionLoader("Updating name...");
  await updateData(`userData/${activeUserId}`, {
    firstName: firstName,
    lastName: lastName,
  });
  await fadeOutEffect(DOM.namePopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// roll no
DOM.individualUserPopup.rollNo.addEventListener("click", () => {
  DOM.rollNoPopup.input.value = activeUserObj.rollNumber;
  fadeInEffect(DOM.rollNoPopup.popup);
});
DOM.rollNoPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.rollNoPopup.popup);
});
DOM.rollNoPopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.rollNoPopup.error);
  const rollNo = Number(DOM.rollNoPopup.input.value.trim());
  const length = DOM.rollNoPopup.input.value.trim().length;
  let isError = false;
  if (length < 6) {
    DOM.rollNoPopup.error.textContent = "Roll No must be 6 digits";
    fadeInEffect(DOM.rollNoPopup.error);
    return;
  }
  if (rollNo < 0) {
    DOM.rollNoPopup.error.textContent = "Roll No is required";
    fadeInEffect(DOM.rollNoPopup.error);
    return;
  }
  if (rollNo) {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollNo),
    );
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        DOM.rollNoPopup.error.textContent = "Roll No already exists";
        fadeInEffect(DOM.rollNoPopup.error);
        hideSectionLoader();
        isError = true;
        return;
      } else {
        hideSectionLoader();
        const isConfirmed = await showConfirmationPopup(
          "This will change the roll no of the student. Are you sure?",
        );
        if (!isConfirmed) return;
        else {
          showSectionLoader("Updating roll number...");
          await updateData(`userData/${activeUserId}`, {
            rollNumber: rollNo,
          });
          fadeOutEffect(DOM.rollNoPopup.popup);
        }
      }
    });
    if (isError) return;
  }
  await fadeOutEffect(DOM.rollNoPopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// role
DOM.individualUserPopup.role.addEventListener("click", () => {
  if (activeUserObj.role === "student") DOM.rolePopup.input.value = "student";
  else if (activeUserObj.role === "editor")
    DOM.rolePopup.input.value = "editor";
  fadeInEffect(DOM.rolePopup.popup);
});
DOM.rolePopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.rolePopup.popup);
});
DOM.rolePopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.rolePopup.error);
  const role = DOM.rolePopup.input.value.trim();
  if (!role) {
    DOM.rolePopup.error.textContent = "Role is required";
    fadeInEffect(DOM.rolePopup.error);
    return;
  }
  const isConfirmed = await showConfirmationPopup(
    "This will change the role of the student and their permissions. Are you sure?",
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating role...");
    await updateData(`userData/${activeUserId}`, {
      role: role,
    });
    fadeOutEffect(DOM.rolePopup.popup);
  }
  await fadeOutEffect(DOM.rolePopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// sem div
DOM.individualUserPopup.sem.addEventListener("click", () => {
  const [sem, div] = activeUserObj.class.split("");
  DOM.semDivPopup.inputs.semester.value = sem;
  DOM.semDivPopup.inputs.division.value = div;
  fadeInEffect(DOM.semDivPopup.popup);
});
DOM.individualUserPopup.div.addEventListener("click", () => {
  DOM.semDivPopup.inputs.semester.value = activeUserObj.semester;
  DOM.semDivPopup.inputs.division.value = activeUserObj.division;
  fadeInEffect(DOM.semDivPopup.popup);
});
DOM.semDivPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.semDivPopup.popup);
});
DOM.semDivPopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.semDivPopup.errors.semester);
  fadeOutEffect(DOM.semDivPopup.errors.division);
  let isError = false;
  let sem = DOM.semDivPopup.inputs.semester.value.trim();
  const div = DOM.semDivPopup.inputs.division.value.trim();
  if (!sem) {
    DOM.semDivPopup.errors.semester.textContent = "Semester is required";
    fadeInEffect(DOM.semDivPopup.errors.semester);
    isError = true;
  }
  if (!div) {
    DOM.semDivPopup.errors.division.textContent = "Division is required";
    fadeInEffect(DOM.semDivPopup.errors.division);
    isError = true;
  }
  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the semester and division of the student. Are you sure?",
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating sem and div...");
    await updateData(`userData/${activeUserId}`, {
      class: `${sem}${div}`,
    });
    fadeOutEffect(DOM.semDivPopup.popup);
  }
  await fadeOutEffect(DOM.semDivPopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

//medals
DOM.individualUserPopup.medalPointWrapper.addEventListener("click", () => {
  DOM.medalPopup.inputs.gold.value =
    DOM.individualUserPopup.medals.gold.textContent;
  DOM.medalPopup.inputs.silver.value =
    DOM.individualUserPopup.medals.silver.textContent;
  DOM.medalPopup.inputs.bronze.value =
    DOM.individualUserPopup.medals.bronze.textContent;
  fadeInEffect(DOM.medalPopup.popup);
});
DOM.medalPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.medalPopup.popup);
});
DOM.medalPopup.successBtn.addEventListener("click", async () => {
  fadeOutEffect(DOM.medalPopup.error);
  const gold = Number(DOM.medalPopup.inputs.gold.value.trim());
  const silver = Number(DOM.medalPopup.inputs.silver.value.trim());
  const bronze = Number(DOM.medalPopup.inputs.bronze.value.trim());
  let isError = false;
  if (gold > 5) {
    DOM.medalPopup.error.textContent = "Gold medal cannot be more than 5";
    fadeInEffect(DOM.medalPopup.error);
    isError = true;
  }
  if (silver > 5) {
    DOM.medalPopup.error.textContent = "Silver medal cannot be more than 5";
    fadeInEffect(DOM.medalPopup.error);
    isError = true;
  }
  if (bronze > 5) {
    DOM.medalPopup.error.textContent = "Bronze medal cannot be more than 5";
    fadeInEffect(DOM.medalPopup.error);
    isError = true;
  }

  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the medal counts for the student. Are you sure?",
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating medals...");
    await updateData(`userData/${activeUserId}/medalList`, {
      gold: gold,
      silver: silver,
      bronze: bronze,
    });
    fadeOutEffect(DOM.medalPopup.popup);
  }
  await fadeOutEffect(DOM.medalPopup.popup);
  await fadeOutEffect(DOM.individualUserPopup.popup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});
