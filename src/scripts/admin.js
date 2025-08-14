import {
  get,
  ref,
  db,
  updateData,
  query,
  orderByChild,
  equalTo,
} from "./firebase.js";
import {
  showConfirmationPopup,
  showSectionLoader,
  hideSectionLoader,
  initRouting,
} from "./index";
import { fadeInEffect, fadeOutEffect } from "./animation";
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
let activeStudentId = null;
let activeStudentObj = null;
const DOM = {
  adminSection: document.querySelector(".admin-section"),
  semesterList: document.querySelector(".semester-list"),
  semCardContainer: document.querySelector(".sem-card-container"),
  divisionList: document.querySelector(".division-list"),
  divCardContainer: document.querySelector(".div-card-container"),
  classRoom: document.querySelector(".class-room"),
  studentCardContainer: document.querySelector(".student-card-container"),
  addStudentBtn: document.querySelector(".class-room .add-student-btn"),
  addTeacherBtn: document.querySelector(".class-room .add-teacher-btn"),
  addUserPopup: {
    popup: document.querySelector(".add-user-link-popup-wrapper"),
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
  if (userData) {
    adminAppState.userData = userData;
    adminAppState.userId = userData.id;
  }
  adminAppState.semesterData = await getWholeSemesterData();
  await hideSections(true, true, false, true);
  await fadeInEffect(adminSection);
  const urlParams = new URLSearchParams(window.location.search);
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
  } else {
    await showSemesterList();
  }
}
//semester section
async function showSemesterList() {
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = "Admin Section";
  for (const key in adminAppState.semesterData) {
    const semesterName = key;
    const card = document.createElement("div");
    card.classList.add(
      "card",
      "bg-surface-2",
      "text-text-primary",
      "w-full",
      "rounded-3xl",
      "p-6",
      "text-center",
      "font-semibold",
    );
    card.textContent = semesterName;
    card.addEventListener("click", async (e) => {
      let activeSem = e.target.textContent;
      adminAppState.activeSem = activeSem;
      history.pushState(
        { sem: activeSem },
        "",
        `admin.html?sem=${encodeURIComponent(activeSem)}`,
      );
      showDivisionList();
    });
    DOM.semCardContainer.appendChild(card);
  }
  fadeInEffect(DOM.semesterList);
}
async function unloadSemesterList() {
  DOM.semCardContainer.innerHTML = "";
  fadeOutEffect(DOM.semesterList);
}
//division section
async function showDivisionList() {
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeSem;
  for (const key in adminAppState.semesterData[adminAppState.activeSem]
    .divisionList) {
    const divisionName = `Div - ${key}`;
    const card = document.createElement("div");
    card.classList.add(
      "card",
      "bg-surface-2",
      "text-text-primary",
      "w-full",
      "rounded-3xl",
      "p-6",
      "text-center",
      "font-semibold",
    );
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
  fadeInEffect(DOM.divisionList);
}
async function unloadDivisionList() {
  DOM.divCardContainer.innerHTML = "";
  fadeOutEffect(DOM.divisionList);
}
// class room section
const viewClassRoomButton = document.querySelector(".visit-classroom-btn");
async function showClassRoom() {
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeDiv;
  const studentRawData = await getStudentRawData();
  let sortedRollNoWiseStudentData = {};
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
  adminAppState.semesterData[adminAppState.activeSem].divisionList[
    adminAppState.activeDiv
  ].studentList = sortedRollNoWiseStudentData;
  renderIndividualStudentCard();
  fadeInEffect(DOM.classRoom);
}
async function unloadClassRoom() {
  DOM.studentCardContainer.innerHTML = "";
  fadeOutEffect(DOM.classRoom);
}

viewClassRoomButton.addEventListener("click", async () => {
  await showClassRoom();
});
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
    orderByChild("division"),
    equalTo(adminAppState.activeDiv),
  );
  return get(q).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No users found for div:", adminAppState.activeDiv);
    }
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
      "individual-student-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5";
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
      activeStudentId = key;
      activeStudentObj =
        adminAppState.semesterData[adminAppState.activeSem].divisionList[
          adminAppState.activeDiv
        ].studentList[key];
      initIndividualStudentPopup();
    });
    DOM.studentCardContainer.appendChild(card);
  }
}
//add student link
let encryptedCode = "";
DOM.addStudentBtn.addEventListener("click", () => {
  const encryptedData = encryptObj({
    division: `${adminAppState.activeDiv}`,
    semester: `${adminAppState.activeSem.replace("semester- ", "")}`,
    role: "student",
  });

  DOM.addUserPopup.link.textContent = encryptedData;
  encryptedCode = encryptedData;
  fadeInEffect(DOM.addUserPopup.popup);
});
DOM.addTeacherBtn.addEventListener("click", () => {
  const encryptedData = encryptObj({
    division: `${adminAppState.activeDiv}`,
    semester: `${adminAppState.activeSem.replace("semester- ", "")}`,
    role: "teacher",
  });
  encryptedCode = encryptedData;
  DOM.addUserPopup.link.textContent = encryptedCode;
  fadeInEffect(DOM.addUserPopup.popup);
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
// individual student related
DOM.individualUserPopup.closePopupBtn.addEventListener("click", () => {
  fadeOutEffect(DOM.individualUserPopup.popup);
});
function initIndividualStudentPopup() {
  const student = activeStudentObj;
  console.log(student);
  DOM.individualUserPopup.firstName.textContent = `First Name: ${student.firstName}`;
  DOM.individualUserPopup.lastName.textContent = `Last Name: ${student.lastName}`;
  DOM.individualUserPopup.displayName.textContent = `${student.firstName} ${student.lastName}`;
  DOM.individualUserPopup.rollNo.textContent = `Roll No: ${student.rollNumber}`;
  DOM.individualUserPopup.email.textContent = `Email: ${student.email}`;
  DOM.individualUserPopup.role.textContent = `Role: ${student.role
    .charAt(0)
    .toUpperCase()}${student.role.slice(1)}`;
  const sem = student.semester;
  const div = student.division;
  DOM.individualUserPopup.sem.textContent = `Semester: ${sem}`;
  DOM.individualUserPopup.div.textContent = `Division: ${div.toUpperCase()}`;
  DOM.individualUserPopup.pfp.src = student.pfpLink;
  const gold = student.medalList.gold || 0;
  const silver = student.medalList.silver || 0;
  const bronze = student.medalList.bronze || 0;
  DOM.individualUserPopup.medals.gold.textContent = gold;
  DOM.individualUserPopup.medals.silver.textContent = silver;
  DOM.individualUserPopup.medals.bronze.textContent = bronze;
  const totalPoints = gold * 30 + silver * 20 + bronze * 10;
  DOM.individualUserPopup.points.textContent = totalPoints;
  fadeInEffect(DOM.individualUserPopup.popup);
}

//first name last name
DOM.individualUserPopup.firstName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value =
    DOM.individualUserPopup.firstName.textContent.split(": ")[1];
  DOM.namePopup.inputs.lastName.value =
    DOM.individualUserPopup.lastName.textContent.split(": ")[1];
  fadeInEffect(DOM.namePopup.popup);
});
DOM.individualUserPopup.lastName.addEventListener("click", () => {
  DOM.namePopup.inputs.firstName.value =
    DOM.individualUserPopup.firstName.textContent.split(": ")[1];
  DOM.namePopup.inputs.lastName.value =
    DOM.individualUserPopup.lastName.textContent.split(": ")[1];
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
  await updateData(`userData/${activeStudentId}`, {
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
  DOM.rollNoPopup.input.value = DOM.individualUserPopup.rollNo.textContent =
    activeStudentObj.rollNumber;
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
          await updateData(`userData/${activeStudentId}`, {
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
  if (activeStudentObj.role === "student")
    DOM.rolePopup.input.value = "student";
  else if (activeStudentObj.role === "editor")
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
    await updateData(`userData/${activeStudentId}`, {
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
  DOM.semDivPopup.inputs.semester.value = activeStudentObj.semester;
  DOM.semDivPopup.inputs.division.value = activeStudentObj.division;
  fadeInEffect(DOM.semDivPopup.popup);
});
DOM.individualUserPopup.div.addEventListener("click", () => {
  DOM.semDivPopup.inputs.semester.value = activeStudentObj.semester;
  DOM.semDivPopup.inputs.division.value = activeStudentObj.division;
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
    sem = Number(sem);
    showSectionLoader("Updating sem and div...");
    await updateData(`userData/${activeStudentId}`, {
      semester: sem,
      division: div,
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
    await updateData(`userData/${activeStudentId}/medalList`, {
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
