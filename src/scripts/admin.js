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
//semester section
const semesterList = adminSection.querySelector(".semester-list");
const semCardContainer = semesterList.querySelector(".sem-card-container");
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
      "font-semibold"
    );
    card.textContent = semesterName;
    card.addEventListener("click", async (e) => {
      let activeSem = e.target.textContent;
      adminAppState.activeSem = activeSem;
      history.pushState(
        { sem: activeSem },
        "",
        `admin.html?sem=${encodeURIComponent(activeSem)}`
      );
      showDivisionList();
    });
    semCardContainer.appendChild(card);
  }
  fadeInEffect(semesterList);
}
async function unloadSemesterList() {
  semCardContainer.innerHTML = "";
  fadeOutEffect(semesterList);
}

//division section
const divisionList = adminSection.querySelector(".division-list");
const divCardContainer = divisionList.querySelector(".div-card-container");
async function showDivisionList() {
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeSem;
  console.log(adminAppState.semesterData[adminAppState.activeSem].divisionList);

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
      "font-semibold"
    );
    card.textContent = divisionName;

    card.addEventListener("click", async (e) => {
      let activeDiv = e.target.textContent.replace("Div - ", "");
      adminAppState.activeDiv = activeDiv;
      history.pushState(
        { div: activeDiv },
        "",
        `admin.html?sem=${encodeURIComponent(
          adminAppState.activeSem
        )}&div=${encodeURIComponent(activeDiv)}`
      );
      showClassRoom();
    });
    divCardContainer.appendChild(card);
  }
  fadeInEffect(divisionList);
}
async function unloadDivisionList() {
  divCardContainer.innerHTML = "";
  fadeOutEffect(divisionList);
}

// class room section
const classRoom = adminSection.querySelector(".class-room");
const studentCardContainer = classRoom.querySelector(".student-card-container");
const viewClassRoomButton = document.querySelector(".visit-classroom-btn");
async function showClassRoom() {
  await hideAdminDivisions();
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/semester.png?updatedAt=1751607364675";
  headerTitle.textContent = adminAppState.activeDiv;
  const studentRawData = await getStudentRawData();
  console.log(studentRawData);
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
  console.log();

  adminAppState.semesterData[adminAppState.activeSem].divisionList[
    adminAppState.activeDiv
  ].studentList = sortedRollNoWiseStudentData;
  console.log(
    adminAppState.semesterData[adminAppState.activeSem].divisionList[
      adminAppState.activeDiv
    ].studentList
  );
  renderIndividualStudentCard();
  await fadeInEffect(classRoom);
}
async function hideClassRoom() {
  fadeOutEffect(classRoom);
}
async function unloadClassRoom() {
  studentCardContainer.innerHTML = "";
  fadeOutEffect(classRoom);
}
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
  console.log(div);
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
    equalTo(adminAppState.activeDiv)
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
    // card.addEventListener("click", () => {
    //   activeStudentObj = student;
    //   activeStudent = `${student.firstName}${student.lastName}`;
    //   history.pushState(
    //     { student: activeStudent },
    //     "",
    //     `admin.html?sem=${encodeURIComponent(
    //       activeSem
    //     )}&div=${activeDiv}&student=${activeStudent}`
    //   );
    //   loadIndividualStudentPage();
    // });
    studentCardContainer.appendChild(card);
  }
}

//add student link
const addStudentButton = adminSection.querySelector(".add-student-btn");
const addStudentPopup = adminSection.querySelector(
  ".add-student-link-popup-wrapper"
);
const addStudentLink = adminSection.querySelector("#add-student-link");
const addStudentLinkOkayBtn = addStudentPopup.querySelector(".okay-btn");
let encryptedLink = "";
addStudentButton.addEventListener("click", () => {
  const encryptedData = encryptLink({
    division: `${adminAppState.activeDiv}`,
    semester: `${adminAppState.activeSem}`,
    role: "student",
  });
  encryptedLink = encryptedData;
  const signupUrl = `http://localhost:5173/signup?data=${encodeURIComponent(
    encryptedData
  )}`;
  addStudentLink.textContent = signupUrl;
  fadeInEffect(addStudentPopup);
});
addStudentLinkOkayBtn.addEventListener("click", () => {
  fadeOutEffect(addStudentPopup);
});
addStudentLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard.writeText(addStudentLink.textContent);
  addStudentLink.textContent = "Copied!";
  setTimeout(() => {
    addStudentLink.textContent = encryptedLink;
  }, 2000);
});
function encryptLink(obj) {
  const str = JSON.stringify(obj);
  const reversed = str.split("").reverse().join("");
  return btoa(reversed);
}
// individual student related
let activeStudentId = null;
let activeStudentObj = null;
const individualStudentPopup = adminSection.querySelector(
  ".individual-student-popup"
);
const displayName = individualStudentPopup.querySelector(
  ".student-display-name"
);
const firstNameP = individualStudentPopup.querySelector(".first-name");
const lastNameP = individualStudentPopup.querySelector(".last-name");
const rollNoP = individualStudentPopup.querySelector(".roll-no");
const emailP = individualStudentPopup.querySelector(".email");
const semP = individualStudentPopup.querySelector(".sem");
const divP = individualStudentPopup.querySelector(".div");
const roleP = individualStudentPopup.querySelector(".role");
const pfpImg = individualStudentPopup.querySelector(".student-display-pfp");
const goldMedal = individualStudentPopup.querySelector(".gold-medal .qty");
const silverMedals = individualStudentPopup.querySelector(".silver-medal .qty");
const bronzMedals = individualStudentPopup.querySelector(".bronz-medal .qty");
const medalsPointsP = individualStudentPopup.querySelector(".points");
const medalPointWrapper = individualStudentPopup.querySelector(
  ".medal-point-wrapper"
);
const individualStudentCloseBtn =
  individualStudentPopup.querySelector(".close-popup-btn");
individualStudentCloseBtn.addEventListener("click", () => {
  fadeOutEffect(individualStudentPopup);
});
function initIndividualStudentPopup() {
  const student =
    adminAppState.semesterData[adminAppState.activeSem].divisionList[
      adminAppState.activeDiv
    ].studentList[activeStudentId];
  console.log(student);
  firstNameP.textContent = `First Name: ${student.firstName}`;
  lastNameP.textContent = `Last Name: ${student.lastName}`;
  displayName.textContent = `${student.firstName} ${student.lastName}`;
  rollNoP.textContent = `Roll No: ${student.rollNumber}`;
  emailP.textContent = `Email: ${student.email}`;
  roleP.textContent = `Role: ${student.role
    .charAt(0)
    .toUpperCase()}${student.role.slice(1)}`;
  const sem = student.semester;
  const div = student.division;
  semP.textContent = `Semester: ${sem}`;
  divP.textContent = `Division: ${div.toUpperCase()}`;
  pfpImg.src = student.pfpLink;
  const gold = student.medalList.gold || 0;
  const silver = student.medalList.silver || 0;
  const bronze = student.medalList.bronze || 0;
  goldMedal.textContent = gold;
  silverMedals.textContent = silver;
  bronzMedals.textContent = bronze;
  const totalPoints = gold * 30 + silver * 20 + bronze * 10;
  medalsPointsP.textContent = totalPoints;
  fadeInEffect(individualStudentPopup);
}

//first name last name
const editNamePopup = adminSection.querySelector(".edit-name-popup-wrapper");
const editNameFirstNameInput = editNamePopup.querySelector(".first-name-input");
const editNameLastNameInput = editNamePopup.querySelector(".last-name-input");
const editNameEditBtn = editNamePopup.querySelector(".edit-btn");
const editNameCloseBtn = editNamePopup.querySelector(".close-popup-btn");
const firstNameError = editNamePopup.querySelector(".first-name-related-error");
const lastNameError = editNamePopup.querySelector(".last-name-related-error");
firstNameP.addEventListener("click", () => {
  editNameFirstNameInput.value = firstNameP.textContent.split(": ")[1];
  editNameLastNameInput.value = lastNameP.textContent.split(": ")[1];
  fadeInEffect(editNamePopup);
});
lastNameP.addEventListener("click", () => {
  editNameFirstNameInput.value = firstNameP.textContent.split(": ")[1];
  editNameLastNameInput.value = lastNameP.textContent.split(": ")[1];
  fadeInEffect(editNamePopup);
});
editNameCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editNamePopup);
});
editNameEditBtn.addEventListener("click", async () => {
  fadeOutEffect(firstNameError);
  fadeOutEffect(lastNameError);
  const firstName = editNameFirstNameInput.value.trim();
  const lastName = editNameLastNameInput.value.trim();
  let isError = false;
  if (!firstName) {
    firstNameError.textContent = "First Name is required";
    fadeInEffect(firstNameError);
    isError = true;
  }
  if (!lastName) {
    lastNameError.textContent = "Last Name is required";
    fadeInEffect(lastNameError);
    isError = true;
  }
  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the name of the student. Are you sure?"
  );
  if (!isConfirmed) return;
  showSectionLoader("Updating name...");
  await updateData(`userData/${activeStudentId}`, {
    firstName: firstName,
    lastName: lastName,
  });
  await fadeOutEffect(editNamePopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// roll no
const editRollNoPopup = adminSection.querySelector(
  ".edit-roll-no-popup-wrapper"
);
const editRollNoInput = editRollNoPopup.querySelector(".roll-no-input");
const editRollNoEditBtn = editRollNoPopup.querySelector(".edit-btn");
const editRollNoCloseBtn = editRollNoPopup.querySelector(".close-popup-btn");
const rollNoError = editRollNoPopup.querySelector(".roll-no-related-error");
rollNoP.addEventListener("click", () => {
  editRollNoInput.value = rollNoP.textContent.split(": ")[1];
  fadeInEffect(editRollNoPopup);
});
editRollNoCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editRollNoPopup);
});
editRollNoEditBtn.addEventListener("click", async () => {
  fadeOutEffect(rollNoError);
  const rollNo = Number(editRollNoInput.value.trim());
  const length = editRollNoInput.value.trim().length;
  console.log(length, rollNo);

  if (length < 6) {
    rollNoError.textContent = "Roll No must be 6 digits";
    fadeInEffect(rollNoError);
    return;
  }
  if (rollNo < 0) {
    rollNoError.textContent = "Roll No is required";
    fadeInEffect(rollNoError);
    return;
  }
  if (rollNo) {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "users"),
      orderByChild("rollNumber"),
      equalTo(rollNo)
    );
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        rollNoError.textContent = "Roll No already exists";
        fadeInEffect(rollNoError);
        hideSectionLoader();
        isError = true;
        return;
      } else {
        hideSectionLoader();
        const isConfirmed = await showConfirmationPopup(
          "This will change the roll no of the student. Are you sure?"
        );
        if (!isConfirmed) return;
        else {
          showSectionLoader("Updating roll number...");
          await updateData(`users/${activeStudentId}`, {
            rollNumber: rollNumber,
          });
          fadeOutEffect(editRollNoPopup);
        }
      }
      if (isError) return;
    });
  }
  await fadeOutEffect(editRollNoPopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// email
const editEmailPopup = adminSection.querySelector(".edit-email-popup-wrapper");
const editEmailInput = editEmailPopup.querySelector(".email-input");
const editEmailEditBtn = editEmailPopup.querySelector(".edit-btn");
const editEmailCloseBtn = editEmailPopup.querySelector(".close-popup-btn");
const emailError = editEmailPopup.querySelector(".email-related-error");
emailP.addEventListener("click", () => {
  editEmailInput.value = emailP.textContent.split(": ")[1];
  fadeInEffect(editEmailPopup);
});
editEmailCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editEmailPopup);
});
editEmailEditBtn.addEventListener("click", async () => {
  fadeOutEffect(emailError);
  const email = editEmailInput.value.trim();
  if (!email) {
    emailError.textContent = "Email is required";
    fadeInEffect(emailError);
    return;
  }
  if (!email.includes("@")) {
    emailError.textContent = "Invalid email format";
    fadeInEffect(emailError);
    return;
  }
  showSectionLoader("Checking email...");
  const q = query(ref(db, "userData"), orderByChild("email"), equalTo(email));
  await get(q).then(async (snapshot) => {
    if (snapshot.exists()) {
      emailError.textContent = "Email already exists";
      fadeInEffect(emailError);
      hideSectionLoader();
      isError;
      return;
    } else {
      hideSectionLoader();
      const isConfirmed = await showConfirmationPopup(
        "This will change the email of the student. Are you sure?"
      );
      if (!isConfirmed) return;
      else {
        showSectionLoader("Updating email...");
        await updateData(`userData/${activeStudentId}`, {
          email: email,
        });
        fadeOutEffect(editEmailPopup);
      }
    }
    if (isError) return;
  });
  await fadeOutEffect(editEmailPopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

//role
const editRolePopup = adminSection.querySelector(".edit-role-popup-wrapper");
const editRoleInput = editRolePopup.querySelector(".role-input");
const editRoleEditBtn = editRolePopup.querySelector(".edit-btn");
const editRoleCloseBtn = editRolePopup.querySelector(".close-popup-btn");
const roleError = editRolePopup.querySelector(".role-related-error");
roleP.addEventListener("click", () => {
  if (activeStudentObj.role === "student") editRoleInput.value = "student";
  else if (activeStudentObj.role === "editor") editRoleInput.value = "editor";
  fadeInEffect(editRolePopup);
});
editRoleCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editRolePopup);
});
editRoleEditBtn.addEventListener("click", async () => {
  fadeOutEffect(roleError);
  const role = editRoleInput.value.trim();
  console.log(role);
  if (!role) {
    roleError.textContent = "Role is required";
    fadeInEffect(roleError);
    return;
  }
  const isConfirmed = await showConfirmationPopup(
    "This will change the role of the student and their permissions. Are you sure?"
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating role...");
    await updateData(`userData/${activeStudentId}`, {
      role: role,
    });
    fadeOutEffect(editRolePopup);
  }
  await fadeOutEffect(editRolePopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

// sem div
const editSemDivPopup = adminSection.querySelector(
  ".edit-sem-div-popup-wrapper"
);
const editSemInput = editSemDivPopup.querySelector(".semester-input");
const editDivInput = editSemDivPopup.querySelector(".division-input");
const editSemDivEditBtn = editSemDivPopup.querySelector(".edit-btn");
const editSemDivCloseBtn = editSemDivPopup.querySelector(".close-popup-btn");
const semError = editSemDivPopup.querySelector(".semester-related-error");
const divError = editSemDivPopup.querySelector(".division-related-error");
semP.addEventListener("click", () => {
  editSemInput.value = activeStudentObj.sem;
  editDivInput.value = activeStudentObj.div;
  fadeInEffect(editSemDivPopup);
});
divP.addEventListener("click", () => {
  editSemInput.value = activeStudentObj.sem;
  editDivInput.value = activeStudentObj.div;
  fadeInEffect(editSemDivPopup);
});
editSemDivCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editSemDivPopup);
});
editSemDivEditBtn.addEventListener("click", async () => {
  fadeOutEffect(semError);
  fadeOutEffect(divError);
  let isError = false;
  const sem = editSemInput.value.trim();
  const div = editDivInput.value.trim();
  if (!sem) {
    semError.textContent = "Semester is required";
    fadeInEffect(semError);
    isError = true;
  }
  if (!div) {
    divError.textContent = "Division is required";
    fadeInEffect(divError);
    isError = true;
  }
  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the semester and division of the student. Are you sure?"
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating sem and div...");
    await updateData(`userData/${activeStudentId}`, {
      semester: sem,
      division: div,
    });
    fadeOutEffect(editSemDivPopup);
  }
  await fadeOutEffect(editSemDivPopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});

//medals
const editMedalsPopup = adminSection.querySelector(".edit-medal-popup-wrapper");
const editGoldMedalInput = editMedalsPopup.querySelector(".gold-medal-input");
const editSilverMedalInput = editMedalsPopup.querySelector(
  ".silver-medal-input"
);
const editBronzeMedalInput = editMedalsPopup.querySelector(
  ".bronze-medal-input"
);
const editMedalsEditBtn = editMedalsPopup.querySelector(".edit-btn");
const editMedalsCloseBtn = editMedalsPopup.querySelector(".close-popup-btn");
const goldMedalError = editMedalsPopup.querySelector(
  ".gold-medal-related-error"
);
const medalError = editMedalsPopup.querySelector(".medal-related-error");

medalPointWrapper.addEventListener("click", () => {
  editGoldMedalInput.value = goldMedal.textContent;
  editSilverMedalInput.value = silverMedals.textContent;
  editBronzeMedalInput.value = bronzMedals.textContent;
  fadeInEffect(editMedalsPopup);
});
editMedalsCloseBtn.addEventListener("click", () => {
  fadeOutEffect(editMedalsPopup);
});
editMedalsEditBtn.addEventListener("click", async () => {
  fadeOutEffect(medalError);
  const gold = Number(editGoldMedalInput.value.trim());
  const silver = Number(editSilverMedalInput.value.trim());
  const bronze = Number(editBronzeMedalInput.value.trim());
  let isError = false;
  if (gold > 5) {
    medalError.textContent = "Gold medal cannot be more than 5";
    fadeInEffect(medalError);
    isError = true;
  }
  if (silver > 5) {
    medalError.textContent = "Silver medal cannot be more than 5";
    fadeInEffect(medalError);
    isError = true;
  }
  if (bronze > 5) {
    medalError.textContent = "Bronze medal cannot be more than 5";
    fadeInEffect(medalError);
    isError = true;
  }

  if (isError) return;
  const isConfirmed = await showConfirmationPopup(
    "This will change the medal counts for the student. Are you sure?"
  );
  if (!isConfirmed) return;
  else {
    showSectionLoader("Updating medals...");
    await updateData(`userData/${activeStudentId}/medalList`, {
      gold: gold,
      silver: silver,
      bronze: bronze,
    });
    fadeOutEffect(editMedalsPopup);
  }
  await fadeOutEffect(editMedalsPopup);
  await fadeOutEffect(individualStudentPopup);
  showSectionLoader("Syncing data...");
  await syncAdminData();
  hideSectionLoader();
  hideAdminDivisions();
  await showClassRoom();
});
