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
import {
  sem1Icons,
  sem2Icons,
  sem3Icons,
  sem4Icons,
  sem5Icons,
  sem6Icons,
} from "./iconLibrary.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
const addStudentBtn = document.querySelector("#add-student-btn");
let dbSemesterData;
const navTitle = document.querySelector(".nav-title");
const navIcon = document.querySelector(".nav-icon ");
const dbpath = ref(db, "semesters");
const loadingScreen = document.querySelector(".loading-screen-container");
get(dbpath)
  .then((snapshot) => {
    if (snapshot.exists()) {
      dbSemesterData = snapshot.val();
      console.log(dbSemesterData);
      console.log(dbSemesterData);
      initRouting();
      fadeOutEffect(loadingScreen);
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    // window.location.href = "error.html";
    console.error(error);
  });
let activeDiv;
let activeSem;
let activeStudent;
let activeStudentObj;

//  semesters section variables and listners
const semestersSection = document.querySelector("#semesters-section");
const semParameters = {
  divisions: "",
  notice: "",
  popups: "",
};
const addSemBtn = document.querySelector("#add-sem-btn");
const semCardContainer = document.querySelector(".sem-card-container");
async function loadSemestersPage() {
  await unloadIndividualDivisionPage();
  await unloadSemstersPage();
  await unloadDivisionsOfSemesterPage();
  await unloadIndividualStudentPage();
  // renders individual sem cards
  for (let element in dbSemesterData) {
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
    card.textContent = element;
    card.addEventListener("click", async (e) => {
      activeSem = e.target.textContent;
      history.pushState(
        { sem: activeSem },
        "",
        `admin.html?sem=${encodeURIComponent(activeSem)}`,
      );
      await unloadSemstersPage();
      loadDivisionsOfSemesterPage();
    });
    semCardContainer.appendChild(card);
  }
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/image.png?updatedAt=1751378410144";
  navTitle.textContent = "Semesters";
  addSemBtn.classList.remove("hidden");
  fadeInEffect(semestersSection);
}
async function unloadSemstersPage() {
  semCardContainer.innerHTML = "";
  navTitle.textContent = "";
  addSemBtn.classList.add("hidden");
  navIcon.src = "";
  await fadeOutEffect(semestersSection);
}
addSemBtn.addEventListener("click", () => {
  let inputSemName;
  createPopup({
    label: ["Semester Name"],
    onCreate: (values) => {
      [inputSemName] = values;
      if (semExists(inputSemName)) return false;
      writeNewSemToDb(inputSemName);
      return true;
    },
    onCancel: () => {
      console.log("Popup cancelled.");
    },
    title: "Add sem",
  });
});
function semExists(inputName) {
  const semFormRelatedError = document.querySelector(".form-related-error");
  for (let element in dbSemesterData) {
    if (element === inputName) {
      console.log("sem exists");
      semFormRelatedError.textContent = "Sem exists";
      semFormRelatedError.classList.remove("hidden");
      return true;
    }
  }
}
function writeNewSemToDb(inputSemName) {
  set(ref(db, "semesters/" + inputSemName), semParameters)
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      console.log(error.message);
      //   window.location.href = "error.html";
    });
}

// divisions page variables and listners
const divisionsOfSemesterSection = document.querySelector(
  "#divisions-of-semester-section",
);
const addDivBtn = document.querySelector("#add-div-btn");
const divCardContainer = document.querySelector(".div-card-container");
const divParameters = {
  notice: "",
  popups: "",
  subjects: "",
};
async function loadDivisionsOfSemesterPage() {
  await unloadIndividualDivisionPage();
  await unloadSemstersPage();
  await unloadDivisionsOfSemesterPage();
  await unloadIndividualStudentPage();
  // reednering division card
  for (let element in dbSemesterData[activeSem].divisions) {
    const card = document.createElement("div");
    console.log(element);
    card.classList.add(
      "card",
      "bg-surface-2",
      "text-text-primary",
      "w-full",
      "max-w-[400px]",
      "rounded-3xl",
      "p-6",
      "text-center",
      "font-semibold",
    );
    card.textContent = element;
    card.addEventListener("click", (e) => {
      unloadDivisionsOfSemesterPage();
      activeDiv = e.target.textContent;
      history.pushState(
        { div: activeDiv },
        "",
        `admin.html?sem=${encodeURIComponent(activeSem)}&div=${encodeURIComponent(activeDiv)}`,
      );
      loadIndividualDivPage();
    });
    divCardContainer.appendChild(card);
  }
  navTitle.textContent = activeSem;
  addDivBtn.classList.remove("hidden");
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/image.png?updatedAt=1751378410144";
  await fadeInEffect(divisionsOfSemesterSection);
}
async function unloadDivisionsOfSemesterPage() {
  divCardContainer.innerHTML = "";
  navTitle.textContent = "";
  addDivBtn.classList.add("hidden");
  navIcon.src = "";
  await fadeOutEffect(divisionsOfSemesterSection);
}
addDivBtn.addEventListener("click", () => {
  let inputDivName;
  createPopup({
    label: ["Division Name"],
    onCreate: (values) => {
      [inputDivName] = values;
      if (divExists(inputDivName)) return false;
      writeNewDivToDb(inputDivName);
      return true;
    },
    onCancel: () => {
      console.log("Popup cancelled.");
    },
    title: "Add division",
  });
});
function divExists(inputName) {
  const divFormRelatedError = document.querySelector(".form-related-error");
  for (let element in dbSemesterData[activeSem].divisions) {
    if (element === inputName) {
      divFormRelatedError.textContent = "div exists";
      divFormRelatedError.classList.remove("hidden");
      return true;
    }
  }
}
function writeNewDivToDb(inputDivName) {
  set(
    ref(db, `semesters/${activeSem}/divisions/${inputDivName}`),
    divParameters,
  )
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      console.log(error.message);
      //   window.location.href = "error.html";
    });
}

// class related var and listners

// student related
let studentsArr = [];
const individualDivisionSection = document.querySelector(
  "#individual-division-section",
);
const individualSubjectCardContainer = document.querySelector(
  ".individual-subject-card-container",
);
const linkPopupContainer = document.querySelector(".link-popup-container");
const addStudentLink = document.querySelector("#add-student-link");
const linkPopupOkBtn = document.querySelector(".link-popup-container button");
const studentsCardContainer = document.querySelector(
  ".students-card-container",
);
linkPopupOkBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await fadeOutEffect(linkPopupContainer);
});
async function loadIndividualDivPage() {
  await unloadSemstersPage();
  await unloadDivisionsOfSemesterPage();
  await unloadIndividualDivisionPage();
  await unloadIndividualStudentPage();
  if (studentsArr.length === 0) await getStudentData();
  renderIndividualStudentCard();
  renderIndividualSubjectCard();
  navTitle.textContent = activeDiv;
  navIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/image.png?updatedAt=1751378410144";
  addStudentBtn.classList.remove("hidden");
  fadeInEffect(individualDivisionSection);
}
async function unloadIndividualDivisionPage() {
  studentsCardContainer.innerHTML = "";
  individualSubjectCardContainer.innerHTML = "";
  navTitle.textContent = "";
  addDivBtn.classList.add("hidden");
  navIcon.src = "";
  console.log("unload individual div page called");

  await fadeOutEffect(individualDivisionSection);
}
function renderIndividualStudentCard() {
  studentsArr.forEach((element) => {
    const card = document.createElement("div");
    card.className =
      "individual-student-card bg-surface-2 flex w-full items-center justify-between rounded-3xl px-6 py-5";

    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = element.pfp;
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";

    const nameP = document.createElement("p");
    nameP.className = "student-name";
    nameP.textContent = `${element.firstName} ${element.lastName}`;

    wrapper.appendChild(img);
    wrapper.appendChild(nameP);

    const rollP = document.createElement("p");
    rollP.className = "roll-no text-text-secondary";
    rollP.textContent = element.rollNo;

    card.appendChild(wrapper);
    card.appendChild(rollP);
    card.addEventListener("click", () => {
      activeStudentObj = element;
      activeStudent = `${element.firstName}${element.lastName}`;
      history.pushState(
        { student: activeStudent },
        "",
        `admin.html?sem=${encodeURIComponent(activeSem)}&div=${activeDiv}&student=${activeStudent}`,
      );
      loadIndividualStudentPage();
    });
    studentsCardContainer.appendChild(card);
  });
}
function getStudentData() {
  const dbpath = ref(db, "students");
  return get(dbpath)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("data exists");
        const studentData = snapshot.val();
        for (let key in studentData) {
          const student = studentData[key];
          if (student.sem === activeSem && student.div === activeDiv) {
            console.log("Matched Student:", student);
            studentsArr.push(student);
          }
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching student data:", error);
    });
}
addStudentLink.addEventListener("click", () => {
  const text = addStudentLink.textContent;
  const popupTitle = document.querySelector(
    ".link-popup-container .popup-title",
  );
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Link copied to clipboard!");
      popupTitle.textContent = "Link copied!";
      setTimeout(() => {
        popupTitle.textContent = "Add student link";
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
});
addStudentBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const targetURL = new URL("http://127.0.0.1:5500/src/html/signup.html");
  targetURL.searchParams.set("activesem", activeSem);
  targetURL.searchParams.set("activediv", activeDiv);
  console.log(targetURL.toString());
  addStudentLink.textContent = targetURL.toString();
  fadeInEffect(linkPopupContainer);
});

// subject related
const addSubjectBtn = document.querySelector("#add-subject-btn");
const selectSubjectIconPopupContainer = document.querySelector(
  "#subject-icon-selection-popup-container",
);
const subjectParameters = {
  subjectName: "",
  notice: "",
  popups: "",
  icon: "",
};
addSubjectBtn.addEventListener("click", (e) => {
  e.preventDefault();
  createPopup({
    label: ["Subject name"],
    onCreate: async (value) => {
      let subName = value;
      if (await subjectExists(subName)) return false;
      console.log(value);
      subjectParameters.subjectName = subName;
      fadeInEffect(selectSubjectIconPopupContainer);
      return true;
    },
    onCancel: () => {
      console.log("Popup cancled");
    },
    title: "Add subject",
  });
});
function subjectExists(inputSubject) {
  const divFormRelatedError = document.querySelector(".form-related-error");
  for (const key in dbSemesterData[activeSem].divisions[activeDiv].subjects) {
    console.log(key);
    if (inputSubject == key) {
      console.log("subject key exists");
      divFormRelatedError.textContent = "subject exists";
      divFormRelatedError.classList.remove("hidden");
      return true;
    }
  }

  console.log(dbSemesterData[activeSem].divisions[activeDiv].subjects);

  return false;
}
const selectedSubjectPopupNextBtn = document.querySelector(
  "#subject-icon-selection-popup-container .next-btn",
);
const selectedSubjectPopupPrevBtn = document.querySelector(
  "#subject-icon-selection-popup-container .back-btn",
);
const subjectIconContainer = document.querySelector(".subject-icon-container");
const selectedIcon = document.querySelector("#selected-icon");
const sem1IconsContainer = document.querySelector("#sem1-icon-container");
const sem2IconsContainer = document.querySelector("#sem2-icon-container");
const sem3IconsContainer = document.querySelector("#sem3-icon-container");
const sem4IconsContainer = document.querySelector("#sem4-icon-container");
const sem5IconsContainer = document.querySelector("#sem5-icon-container");
const sem6IconsContainer = document.querySelector("#sem6-icon-container");
const selectedSubjectIcon = document.querySelector("#selected-icon");
renderImage(sem1IconsContainer, sem1Icons);
renderImage(sem2IconsContainer, sem2Icons);
renderImage(sem3IconsContainer, sem3Icons);
renderImage(sem4IconsContainer, sem4Icons);
renderImage(sem5IconsContainer, sem5Icons);
renderImage(sem6IconsContainer, sem6Icons);
function renderImage(wrapper, link) {
  link.forEach((element) => {
    const pfp = document.createElement("img");
    pfp.src = element;
    pfp.loading = "lazy";
    pfp.classList.add("h-full", "w-full");
    wrapper.appendChild(pfp);
  });
}
subjectIconContainer.addEventListener("click", async (e) => {
  if (e.target.tagName !== "IMG") return;
  await fadeOutEffect(selectedSubjectIcon);
  selectedSubjectIcon.firstElementChild.src = e.target.currentSrc;
  await new Promise((resolve) => {
    if (selectedSubjectIcon.firstElementChild.complete) {
      resolve();
    } else {
      selectedSubjectIcon.firstElementChild.onload = () => resolve();
    }
  });
  fadeInEffect(selectedSubjectIcon);
});
selectedSubjectPopupNextBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  subjectParameters.icon = selectedIcon.firstElementChild.src;
  await fadeOutEffect(selectSubjectIconPopupContainer);
  writeNewSubjectToDb(subjectParameters.subjectName);
  console.log(subjectParameters);
});
selectedSubjectPopupPrevBtn.addEventListener("click", async (e) => {
  subjectParameters.icon = "";
  subjectParameters.subjectName = "";
  await fadeOutEffect(selectSubjectIconPopupContainer);
});
function writeNewSubjectToDb(inputSubject) {
  set(
    ref(
      db,
      `semesters/${activeSem}/divisions/${activeDiv}/subjects/${inputSubject}`,
    ),
    subjectParameters,
  )
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      console.log(error.message);
      //   window.location.href = "error.html";
    });
}
function renderIndividualSubjectCard() {
  const subjects = dbSemesterData[activeSem].divisions[activeDiv].subjects;
  for (let key in subjects) {
    const subjectObj = subjects[key]; // get the actual subject object

    const subjectCard = document.createElement("div");
    subjectCard.className =
      "individual-subject-card bg-surface-2 flex w-full items-center justify-start rounded-3xl px-6 py-5";

    const wrapper = document.createElement("div");
    wrapper.className = "image-name-wrapper flex items-center gap-2";

    const img = document.createElement("img");
    img.src = subjectObj.icon;
    img.alt = "";
    img.className = "pfp h-[45px] w-[45px] lg:h-[50px] lg:w-[50px]";

    const text = document.createElement("p");
    text.className = "subject-name";
    text.textContent = subjectObj.subjectName;

    wrapper.appendChild(img);
    wrapper.appendChild(text);
    subjectCard.appendChild(wrapper);

    individualSubjectCardContainer.appendChild(subjectCard);
  }
}

// student page related var and listner
const studentDisplayName = document.querySelector(".student-display-name");
const individualstudentSection = document.querySelector(
  ".individual-student-section",
);
const studentDisplayPfp = document.querySelector(".student-display-pfp");
const studentInfoWrapper = document.querySelector(".studenet-info-wrapper");
async function loadIndividualStudentPage() {
  await unloadIndividualDivisionPage();
  await unloadSemstersPage();
  await unloadDivisionsOfSemesterPage();
  await unloadIndividualStudentPage();
  studentDisplayPfp.src = activeStudentObj.pfp;
  studentDisplayName.innerHTML = `${activeStudentObj.firstName}<br/>${activeStudentObj.lastName}`;
  for (const key in activeStudentObj) {
    if (key === "pfp") continue;
    const data = activeStudentObj[key];
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper flex items-center";

    const spanBold = document.createElement("span");
    spanBold.className = "font-semibold";
    spanBold.textContent = `${key} : `;

    const spanLight = document.createElement("span");
    spanLight.className = "text-text-secondary h-fit font-light text-wrap";
    spanLight.textContent = `${data}`;

    spanBold.appendChild(spanLight);
    wrapper.appendChild(spanBold);

    studentInfoWrapper.appendChild(wrapper); // or replace with your target container
  }
  await fadeInEffect(individualstudentSection);
}
async function unloadIndividualStudentPage() {
  studentDisplayPfp.src = "";
  studentDisplayName.innerHTML = "";
  studentInfoWrapper.innerHTML = "";
  await fadeOutEffect(individualstudentSection);
}

// other function
function createPopup({
  label = [],
  onCreate = (values) => {},
  onCancel = () => {},
  title,
}) {
  const popupContainer = document.createElement("div");
  popupContainer.classList.add(
    "popup-container",
    "absolute",
    "top-0",
    "left-0",
    "z-20",
    "flex",
    "hidden",
    "h-full",
    "w-full",
    "items-center",
    "justify-center",
    "bg-[#00000020]",
    "transition-all",
    "duration-200",
  );

  const popup = document.createElement("div");
  popup.classList.add(
    "popup",
    "bg-surface-2",
    "flex",
    "flex-col",
    "gap-4",
    "rounded-3xl",
    "p-6",
    "lg:gap-5",
  );
  popupContainer.appendChild(popup);
  const inputRefs = [];
  const inputFieldErrorMsgRefs = [];
  const formRelatedErrorMsg = document.createElement("p");
  formRelatedErrorMsg.classList.add(
    "form-related-error",
    "text-text-error",
    "text-sm",
    "hidden",
  );
  const popupTitle = document.createElement("p");
  popupTitle.classList.add("text-2xl", "font-semibold", "text-text-primary");
  popupTitle.textContent = title;
  popup.appendChild(popupTitle);
  label.forEach((title) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("name-input-wrapper", "flex", "flex-col", "gap-1");

    const label = document.createElement("p");
    label.classList.add("name", "text-text-primary", "px-1");
    label.textContent = title;

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.classList.add(
      "bg-surface-3",
      "border-surface-4",
      "focus:border-surface-3",
      "focus:!ring-primary-400",
      "caret-primary-50",
      "text-primary-50",
      "box-border",
      "w-full",
      "rounded-lg",
      "border-2",
      "px-3",
      "py-1.5",
      "focus:!ring-1",
      "focus:outline-none",
    );
    const errorMsg = document.createElement("p");
    errorMsg.classList.add("text-text-error", "text-sm", "hidden");
    inputRefs.push(input);
    inputFieldErrorMsgRefs.push(errorMsg);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(errorMsg);
    popup.appendChild(wrapper);
  });
  popup.appendChild(formRelatedErrorMsg);

  const btnWrapper = document.createElement("div");
  btnWrapper.classList.add("btn-wrapper", "flex", "gap-4", "justify-end");

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("button-outline");
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = async () => {
    onCancel();
    await fadeOutEffect(popupContainer);
    popupContainer.remove();
  };

  const createBtn = document.createElement("button");
  let isInputEmpty = true;
  createBtn.classList.add("button-fill");
  createBtn.textContent = "Create";
  createBtn.onclick = async () => {
    let isInputEmpty = false; // reset for each click

    inputRefs.forEach((input, i) => {
      const value = input.value.trim();
      const errorMsg = inputFieldErrorMsgRefs[i];

      if (value === "") {
        isInputEmpty = true;
        errorMsg.textContent = "This field is required.";
        errorMsg.classList.remove("hidden");
      } else {
        errorMsg.classList.add("hidden");
      }
    });

    if (!isInputEmpty) {
      const values = inputRefs.map((input) => input.value.trim());
      const shouldClose = await onCreate(values);
      if (shouldClose) {
        await fadeOutEffect(popupContainer);
        popupContainer.remove();
      }
    }
  };

  btnWrapper.appendChild(cancelBtn);
  btnWrapper.appendChild(createBtn);
  popup.appendChild(btnWrapper);
  document.body.appendChild(popupContainer);
  fadeInEffect(popupContainer);
}
async function initActiveStudentObj(inputName) {
  await getStudentData();
  studentsArr.forEach((element) => {
    if (`${element.firstName}${element.lastName}` === inputName) {
      activeStudentObj = element;
      return;
    }
  });
}

// routes
async function initRouting() {
  const params = new URLSearchParams(window.location.search);
  const sem = params.get("sem");
  const div = params.get("div");
  const student = params.get("student");
  activeSem = sem;
  activeDiv = div;
  activeStudent = student;
  if (student) {
    await initActiveStudentObj(student);
    console.log(activeStudentObj);
    loadIndividualStudentPage();
  } else if (div) {
    loadIndividualDivPage();
  } else if (sem) {
    loadDivisionsOfSemesterPage();
  } else {
    loadSemestersPage();
  }
}
window.addEventListener("popstate", async () => {
  const popup = document.querySelector(".popup-container");
  if (popup) {
    await fadeOutEffect(popup);
    popup.remove();
  }
  fadeOutEffect(linkPopupContainer);
});

window.addEventListener("popstate", initRouting);
// window.addEventListener("DOMContentLoaded", initRouting);
