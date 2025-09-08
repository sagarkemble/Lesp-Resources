const sessionsSection = document.querySelector(".sessions-section");
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import {
  hideSections,
  hideSectionLoader,
  showSectionLoader,
  showConfirmationPopup,
  applyEditModeUI,
} from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import {
  pushData,
  updateData,
  deleteData,
  query,
  get,
  ref,
  db,
  orderByChild,
  equalTo,
} from "./firebase.js";
import { appState, syncDbData } from "./appstate.js";
import { showErrorSection } from "./error.js";
import { renderUpcomingSessions } from "./dashboard.js";
const DOM = {
  // Student Details Popup
  studentDetailsPopup: {
    popup: document.querySelector(".student-details-popup-wrapper"),
    name: document.querySelector(".student-details-popup-wrapper .name"),
    sem: document.querySelector(".student-details-popup-wrapper .sem"),
    div: document.querySelector(".student-details-popup-wrapper .div"),
    rollno: document.querySelector(".student-details-popup-wrapper .rollno"),
    cancelBtn: document.querySelector(
      ".student-details-popup-wrapper .cancel-btn",
    ),
    successBtn: document.querySelector(
      ".student-details-popup-wrapper .confirm-btn",
    ),
  },

  // Upcoming Session Popup
  upcomingSessionPopup: {
    popup: document.querySelector(".upcoming-session-popup-wrapper"),
    popupTitle: document.querySelector(
      ".upcoming-session-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".upcoming-session-popup-wrapper .close-popup-btn",
    ),
    deleteBtn: document.querySelector(
      ".upcoming-session-popup-wrapper .delete-btn",
    ),
    successBtn: document.querySelector(
      ".upcoming-session-popup-wrapper .success-btn",
    ),

    inputs: {
      title: document.querySelector("#upcoming-session-title"),
      description: document.querySelector("#add-session-description"),
      rollno: document.querySelector("#upcoming-session-rollno"),
      link: document.querySelector("#add-session-link"),
      date: document.querySelector("#upcoming-session-date-input"),

      toTime: document.querySelector("#upcoming-session-to-time-input"),
      fromTime: document.querySelector("#upcoming-session-from-time-input"),
    },

    errors: {
      title: document.querySelector(
        ".upcoming-session-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".upcoming-session-popup-wrapper .description-error",
      ),
      rollno: document.querySelector(
        ".upcoming-session-popup-wrapper .rollno-error",
      ),
      link: document.querySelector(
        ".upcoming-session-popup-wrapper .link-error",
      ),
      date: document.querySelector(
        ".upcoming-session-popup-wrapper .date-error",
      ),

      fromTime: document.querySelector(
        ".upcoming-session-popup-wrapper .time-from-error",
      ),
      toTime: document.querySelector(
        ".upcoming-session-popup-wrapper .time-to-error",
      ),
    },

    fakeDatePlaceholder: document.querySelector(
      ".upcoming-session-popup-wrapper .fake-placeholder",
    ),
    fakeTimeToPlaceholder: document.querySelector(
      ".upcoming-session-popup-wrapper .to-time-input-wrapper .fake-placeholder",
    ),
    fakeTimeFromPlaceholder: document.querySelector(
      ".upcoming-session-popup-wrapper .from-time-input-wrapper .fake-placeholder",
    ),
  },

  // Previous Session Popup
  previousSessionPopup: {
    popup: document.querySelector(".previous-session-popup-wrapper"),
    popupTitle: document.querySelector(
      ".previous-session-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".previous-session-popup-wrapper .close-popup-btn",
    ),
    deleteBtn: document.querySelector(
      ".previous-session-popup-wrapper .delete-btn",
    ),
    successBtn: document.querySelector(
      ".previous-session-popup-wrapper .success-btn",
    ),

    inputs: {
      title: document.querySelector("#previous-session-title"),
      description: document.querySelector("#previous-session-description"),
      date: document.querySelector("#previous-session-date"),
      toTime: document.querySelector("#previous-session-to-time-input"),
      fromTime: document.querySelector("#previous-session-from-time-input"),
      rollno: document.querySelector("#previous-session-rollno"),
      link: document.querySelector("#previous-session-link"),
    },

    errors: {
      title: document.querySelector(
        ".previous-session-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".previous-session-popup-wrapper .description-error",
      ),
      date: document.querySelector(
        ".previous-session-popup-wrapper .date-error",
      ),
      toTime: document.querySelector(
        ".previous-session-popup-wrapper .time-to-error",
      ),
      fromTime: document.querySelector(
        ".previous-session-popup-wrapper .time-from-error",
      ),
      rollno: document.querySelector(
        ".previous-session-popup-wrapper .rollno-error",
      ),
      link: document.querySelector(
        ".previous-session-popup-wrapper .link-error",
      ),
    },

    fakeTimeToPlaceholder: document.querySelector(
      ".previous-session-popup-wrapper .to-time-input-wrapper .fake-placeholder",
    ),
    fakeTimeFromPlaceholder: document.querySelector(
      ".previous-session-popup-wrapper .from-time-input-wrapper .fake-placeholder",
    ),
    fakeDatePlaceholder: document.querySelector(
      ".previous-session-popup-wrapper .date-input-wrapper .fake-placeholder",
    ),
  },

  // Upcoming Sessions Section
  upcomingSessions: {
    container: document.querySelector(".upcoming-sessions"),
    containerTitle: document.querySelector(
      ".upcoming-sessions .container-title",
    ),
    addContentBtn: document.querySelector(
      ".upcoming-sessions .add-content-btn",
    ),
    noUpcomingSession: document.querySelector(
      ".upcoming-sessions .no-upcoming-session",
    ),
    cardContainer: document.querySelector(".upcoming-sessions .card-container"),
  },

  // Previous Sessions Section
  previousSessions: {
    container: document.querySelector(".previous-sessions"),
    containerTitle: document.querySelector(
      ".previous-sessions .container-title",
    ),
    addContentBtn: document.querySelector(".previous-sessions .add-btn"),
    noPreviousSession: document.querySelector(
      ".previous-sessions .no-previous-sessions",
    ),
    cardContainer: document.querySelector(".previous-sessions .card-container"),
  },
};
export async function loadSessionsSection() {
  try {
    await unloadSessionsSection();
    await renderUpcomingSession();
    await renderPreviousSession();
    applyEditModeUI();
  } catch (error) {
    showErrorSection("Error loading sessions:", error);
  }
}
async function unloadSessionsSection() {
  await fadeOutEffect(sessionsSection);
  DOM.upcomingSessions.cardContainer.innerHTML = "";
  DOM.previousSessions.cardContainer.innerHTML = "";
}
export async function showSessionsSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/session.png?updatedAt=1753970178886";
  headerTitle.textContent = "Sessions";
  await hideSections();
  fadeInEffect(sessionsSection);
}

//upcoming sessions functions and listeners
let isUpcomingSessionEditing = false;
let selectedUpcomingSessionId = null;
DOM.upcomingSessions.addContentBtn.addEventListener("click", () => {
  fadeInEffect(DOM.upcomingSessionPopup.popup);
});
DOM.upcomingSessionPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.upcomingSessionPopup.popup);
  resetUpcomingSessionsPopup();
});
DOM.upcomingSessionPopup.inputs.date.addEventListener("input", () => {
  hideElement(DOM.upcomingSessionPopup.fakeDatePlaceholder);
  DOM.upcomingSessionPopup.fakeDatePlaceholder.focus();
});
DOM.upcomingSessionPopup.inputs.date.addEventListener("click", () => {
  if (DOM.upcomingSessionPopup.inputs.date.showPicker) {
    DOM.upcomingSessionPopup.inputs.date.showPicker();
  } else {
    DOM.upcomingSessionPopup.inputs.date.focus();
  }
});
DOM.upcomingSessionPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.upcomingSessionPopup.errors.title);
  hideElement(DOM.upcomingSessionPopup.errors.description);
  hideElement(DOM.upcomingSessionPopup.errors.link);
  hideElement(DOM.upcomingSessionPopup.errors.date);
  hideElement(DOM.upcomingSessionPopup.errors.rollno);
  hideElement(DOM.upcomingSessionPopup.errors.toTime);
  hideElement(DOM.upcomingSessionPopup.errors.fromTime);
  const title = DOM.upcomingSessionPopup.inputs.title.value.trim();
  const description = DOM.upcomingSessionPopup.inputs.description.value.trim();
  const link = DOM.upcomingSessionPopup.inputs.link.value.trim();
  const date = DOM.upcomingSessionPopup.inputs.date.value.trim();
  const rollnoInput = DOM.upcomingSessionPopup.inputs.rollno.value.trim();
  const rollno = Number(rollnoInput);
  const toTime = DOM.upcomingSessionPopup.inputs.toTime.value.trim();
  const fromTime = DOM.upcomingSessionPopup.inputs.fromTime.value.trim();
  let userId;
  let isError;
  if (rollnoInput === "") {
    DOM.upcomingSessionPopup.errors.rollno.textContent = "Rollno is required ";
    showElement(DOM.upcomingSessionPopup.errors.rollno);
    isError = true;
  }
  if (title === "") {
    DOM.upcomingSessionPopup.errors.title.textContent = "Title is required";
    showElement(DOM.upcomingSessionPopup.errors.title);
    isError = true;
  }
  if (description === "") {
    DOM.upcomingSessionPopup.errors.description.textContent =
      "Description is required";
    showElement(DOM.upcomingSessionPopup.errors.description);
    isError = true;
  }
  if (rollnoInput === "") {
    DOM.upcomingSessionPopup.errors.rollno.textContent = "Rollno is required";
    showElement(DOM.upcomingSessionPopup.errors.rollno);
    isError = true;
  }
  if (date === "") {
    DOM.upcomingSessionPopup.errors.date.textContent = "Date is required";
    showElement(DOM.upcomingSessionPopup.errors.date);
    isError = true;
  }
  if (toTime === "") {
    DOM.upcomingSessionPopup.errors.toTime.textContent = "Required";
    showElement(DOM.upcomingSessionPopup.errors.toTime);
    isError = true;
  }
  if (fromTime === "") {
    DOM.upcomingSessionPopup.errors.fromTime.textContent = "Required";
    showElement(DOM.upcomingSessionPopup.errors.fromTime);
    isError = true;
  }
  if (link) {
    if (!/^https?:\/\//.test(link)) {
      DOM.upcomingSessionPopup.errors.link.textContent = "Invalid link";
      showElement(DOM.upcomingSessionPopup.errors.link);
      isError = true;
    }
  }
  if (isError) return;
  isError = false;
  if (rollnoInput !== "") {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollno),
    );
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        hideSectionLoader();
        const data = snapshot.val();
        let isConfirm = await studentConfirmationPopup(Object.values(data)[0]);
        if (!isConfirm) {
          DOM.upcomingSessionPopup.inputs.rollno.value = "";
          DOM.upcomingSessionPopup.errors.rollno.textContent =
            "Rollno required";
          isError = true;
        } else {
          userId = Object.values(data)[0].userId;
        }
      } else {
        isError = true;
        DOM.upcomingSessionPopup.errors.rollno.textContent = "Rollno not found";
        showElement(DOM.upcomingSessionPopup.errors.rollno);
        hideSectionLoader();
      }
    });
  }
  if (isError) return;
  if (isUpcomingSessionEditing) {
    showSectionLoader("Updating session...");
    await updateData(
      `globalData/sessionData/upcomingSessionList/${selectedUpcomingSessionId}`,
      {
        title: title,
        description: description,
        link: link,
        date: date,
        fromTime: fromTime,
        toTime: toTime,
        hostRollNumber: rollno,
        hostUserId: userId,
      },
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData(`globalData/sessionData/upcomingSessionList`, {
      title: title,
      description: description,
      link: link,
      date: date,
      fromTime: fromTime,
      toTime: toTime,
      hostRollNumber: rollno,
      hostUserId: userId,
    });
  }
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.upcomingSessionPopup.popup);
  resetUpcomingSessionsPopup();
  await syncDbData();
  await loadSessionsSection();
  await renderUpcomingSessions();
  await hideSectionLoader();
  showSessionsSection();
});
DOM.upcomingSessionPopup.deleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this session?",
  );
  if (isConfirmed) {
    showSectionLoader("Deleting session...");
    await deleteData(
      `globalData/sessionData/upcomingSessionList/${selectedUpcomingSessionId}`,
    );
    showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.upcomingSessionPopup.popup);
    resetUpcomingSessionsPopup();
    await syncDbData();
    await loadSessionsSection();
    await hideSectionLoader();
    showSessionsSection();
  }
});
DOM.upcomingSessionPopup.inputs.title.addEventListener("input", () => {
  if (DOM.upcomingSessionPopup.inputs.title.value.length == 33) {
    DOM.upcomingSessionPopup.errors.title.textContent =
      "Max 32 characters reached";
    DOM.upcomingSessionPopup.inputs.title.value =
      DOM.upcomingSessionPopup.inputs.title.value.slice(0, 32);
    showElement(DOM.upcomingSessionPopup.errors.title);
  } else {
    hideElement(DOM.upcomingSessionPopup.errors.title);
  }
});
DOM.upcomingSessionPopup.inputs.description.addEventListener("input", () => {
  if (DOM.upcomingSessionPopup.inputs.description.value.length == 156) {
    DOM.upcomingSessionPopup.errors.description.textContent =
      "Max 155 characters reached";
    DOM.upcomingSessionPopup.inputs.description.value =
      DOM.upcomingSessionPopup.inputs.description.value.slice(0, 155);
    showElement(DOM.upcomingSessionPopup.errors.description);
  } else {
    hideElement(DOM.upcomingSessionPopup.errors.description);
  }
});
DOM.upcomingSessionPopup.inputs.rollno.addEventListener("input", () => {
  if (DOM.upcomingSessionPopup.inputs.rollno.value.length == 7) {
    DOM.upcomingSessionPopup.errors.rollno.textContent =
      "Roll number should 6 characters only";
    DOM.upcomingSessionPopup.inputs.rollno.value =
      DOM.upcomingSessionPopup.inputs.rollno.value.slice(0, 6);
    showElement(DOM.upcomingSessionPopup.errors.rollno);
  } else {
    hideElement(DOM.upcomingSessionPopup.errors.rollno);
  }
});
DOM.upcomingSessionPopup.inputs.fromTime.addEventListener("click", () => {
  hideElement(DOM.upcomingSessionPopup.fakeTimeFromPlaceholder);
  DOM.upcomingSessionPopup.inputs.fromTime.showPicker();
});
DOM.upcomingSessionPopup.inputs.toTime.addEventListener("click", () => {
  hideElement(DOM.upcomingSessionPopup.fakeTimeToPlaceholder);
  DOM.upcomingSessionPopup.inputs.toTime.showPicker();
});
async function studentConfirmationPopup(data) {
  return new Promise((resolve) => {
    DOM.studentDetailsPopup.rollno.textContent = `Roll no : ${data.rollNumber}`;
    DOM.studentDetailsPopup.name.textContent = `${data.firstName} ${data.lastName}`;
    const [sem, div] = data.class.split("");
    DOM.studentDetailsPopup.sem.textContent = `Semester : ${sem}`;
    DOM.studentDetailsPopup.div.textContent = `Division : ${div}`;
    fadeInEffect(DOM.studentDetailsPopup.popup);
    DOM.studentDetailsPopup.successBtn.addEventListener("click", async () => {
      fadeOutEffect(DOM.studentDetailsPopup.popup);
      resolve(true);
    });
    DOM.studentDetailsPopup.cancelBtn.addEventListener("click", async () => {
      await fadeOutEffect(DOM.studentDetailsPopup.popup);
      resolve(false);
    });
  });
}
function resetUpcomingSessionsPopup() {
  DOM.upcomingSessionPopup.inputs.title.value = "";
  DOM.upcomingSessionPopup.inputs.description.value = "";
  DOM.upcomingSessionPopup.inputs.rollno.value = "";
  DOM.upcomingSessionPopup.inputs.link.value = "";
  DOM.upcomingSessionPopup.inputs.date.value = "";
  DOM.upcomingSessionPopup.inputs.toTime.value = "";
  DOM.upcomingSessionPopup.inputs.fromTime.value = "";
  hideElement(DOM.upcomingSessionPopup.deleteBtn);
  showElement(DOM.upcomingSessionPopup.fakeDatePlaceholder);
  showElement(DOM.upcomingSessionPopup.fakeTimeToPlaceholder);
  showElement(DOM.upcomingSessionPopup.fakeTimeFromPlaceholder);
  hideElement(DOM.upcomingSessionPopup.errors.title);
  hideElement(DOM.upcomingSessionPopup.errors.description);
  hideElement(DOM.upcomingSessionPopup.errors.rollno);
  hideElement(DOM.upcomingSessionPopup.errors.link);
  hideElement(DOM.upcomingSessionPopup.errors.date);
  hideElement(DOM.upcomingSessionPopup.errors.fromTime);
  hideElement(DOM.upcomingSessionPopup.errors.toTime);
}
async function renderUpcomingSession() {
  let isLink = false;
  const data = appState?.globalData?.sessionData?.upcomingSessionList || {};
  if (!data || Object.keys(data).length === 0) {
    showElement(DOM.upcomingSessions.noUpcomingSession);
    return;
  } else hideElement(DOM.upcomingSessions.noUpcomingSession);
  for (const key in data) {
    const session = data[key];
    let { title, description, link, date, fromTime, toTime, hostUserId } =
      session;
    toTime = new Date("1970-01-01 " + toTime);
    fromTime = new Date("1970-01-01 " + fromTime);
    const duration = Math.round((toTime - fromTime) / (1000 * 60));
    if (link) isLink = true;

    const mentorData = await get(ref(db, `userData/${hostUserId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          showErrorSection();
          return;
        }
      })
      .catch((error) => {
        showErrorSection();
        return;
      });

    const name = `${mentorData.firstName} ${mentorData.lastName}`;
    const [sem, div] = mentorData.class.split("");
    const mentorClass = getFormattedClass(sem, div);
    const pfp = mentorData.pfpLink;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 flex flex-col gap-4 lg:gap-5 w-full rounded-3xl lg:max-w-[31.25rem] p-6 editor-hover-pointer";

    card.innerHTML = `
      <div class="wrapper w-full flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3 icon-name-wrapper">
          <img
            src="${pfp}"
            class="h-[2.75rem] w-[2.75rem] object-cover rounded-full"
            alt="Mentor"
          />
          <div class="wrapper w-full truncate">
            <p class="text-xl truncate w-full">${name.charAt(0).toUpperCase() + name.slice(1)}</p>
            <p class="text-xs text-text-tertiary">${mentorClass}</p>
          </div>
        </div>
        ${
          link
            ? `<div><a href="${link}" target="_blank"><button class="button-hug mt-2">Join</button></a></div>`
            : `<p class="status text-xs text-text-link shrink-0">Coming soon</p>`
        }

      </div>
      <div class="wrapper flex flex-col gap-2">
        <p class="title text-xl font-semibold">${title.charAt(0).toUpperCase() + title.slice(1)}</p>
        <div class="description text-text-secondary">
          ${description.charAt(0).toUpperCase() + description.slice(1)}
        </div>
      </div>
      <div class="duration-date-wrapper text-xs font-light flex flex-col gap-1">
<p class="day">${formatDate(date)} at ${formatTime(fromTime)}</p>
        <p class="duration">Duration : ${duration} mins</p>
      </div>
   
    `;
    DOM.upcomingSessions.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (!appState.isEditing) return;
      editUpcomingSessionCard(key);
    });
  }
  if (isLink)
    DOM.upcomingSessions.containerTitle.textContent =
      "Current ongoing Sessions";
  else DOM.upcomingSessions.containerTitle.textContent = "Upcoming Sessions";
}
function getFormattedClass(sem, div) {
  const semMap = {
    1: "FYCO",
    2: "FYCO",
    3: "SYCO",
    4: "SYCO",
    5: "TYCO",
    6: "TYCO",
  };
  const formattedSem = semMap[sem] || sem;
  return `${formattedSem}-${div}`;
}
function formatTime(dateObj) {
  return dateObj
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase(); // for "pm" instead of "PM"
}
function editUpcomingSessionCard(id) {
  isUpcomingSessionEditing = true;
  selectedUpcomingSessionId = id;
  DOM.upcomingSessionPopup.popupTitle.textContent = "Edit Session";
  const session = appState.globalData.sessionData.upcomingSessionList[id];
  DOM.upcomingSessionPopup.inputs.title.value = session.title;
  DOM.upcomingSessionPopup.inputs.description.value = session.description;
  DOM.upcomingSessionPopup.inputs.rollno.value = session.hostRollNumber;
  DOM.upcomingSessionPopup.inputs.link.value = session.link;
  DOM.upcomingSessionPopup.inputs.date.value = session.date;
  DOM.upcomingSessionPopup.inputs.fromTime.value = session.fromTime;
  DOM.upcomingSessionPopup.inputs.toTime.value = session.toTime;
  showElement(DOM.upcomingSessionPopup.deleteBtn);
  hideElement(DOM.upcomingSessionPopup.fakeDatePlaceholder);
  hideElement(DOM.upcomingSessionPopup.fakeTimeToPlaceholder);
  hideElement(DOM.upcomingSessionPopup.fakeTimeFromPlaceholder);
  fadeInEffect(DOM.upcomingSessionPopup.popup);
}

//previous sessions functions and listeners
let isPreviousSessionEditing = false;
let selectedPreviousSessionId = null;
DOM.previousSessionPopup.inputs.date.addEventListener("input", () => {
  DOM.previousSessionPopup.inputs.date.focus();
  hideElement(DOM.previousSessionPopup.fakeDatePlaceholder);
});
DOM.previousSessionPopup.inputs.date.addEventListener("click", () => {
  if (DOM.previousSessionPopup.inputs.date.showPicker) {
    DOM.previousSessionPopup.inputs.date.showPicker();
  } else {
    DOM.previousSessionPopup.inputs.date.focus();
  }
});
DOM.previousSessions.addContentBtn.addEventListener("click", () => {
  fadeInEffect(DOM.previousSessionPopup.popup);
});
DOM.previousSessionPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.previousSessionPopup.popup);
  resetPreviousSessionsPopup();
});
DOM.previousSessionPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.previousSessionPopup.errors.title);
  hideElement(DOM.previousSessionPopup.errors.description);
  hideElement(DOM.previousSessionPopup.errors.rollno);
  hideElement(DOM.previousSessionPopup.errors.date);
  hideElement(DOM.previousSessionPopup.errors.fromTime);
  hideElement(DOM.previousSessionPopup.errors.toTime);
  hideElement(DOM.previousSessionPopup.errors.link);
  const title = DOM.previousSessionPopup.inputs.title.value.trim();
  const description = DOM.previousSessionPopup.inputs.description.value.trim();
  const date = DOM.previousSessionPopup.inputs.date.value.trim();
  const fromTime = DOM.previousSessionPopup.inputs.fromTime.value.trim();
  const toTime = DOM.previousSessionPopup.inputs.toTime.value.trim();
  const link = DOM.previousSessionPopup.inputs.link.value.trim();
  const rollnoInput = DOM.previousSessionPopup.inputs.rollno.value.trim();
  const rollno = Number(rollnoInput);
  let userId;
  let isError;
  if (rollnoInput === "") {
    DOM.previousSessionPopup.errors.rollno.textContent = "Rollno is required";
    showElement(DOM.previousSessionPopup.errors.rollno);
    isError = true;
  }
  if (title === "") {
    DOM.previousSessionPopup.errors.title.textContent = "Title is required";
    showElement(DOM.previousSessionPopup.errors.title);
    isError = true;
  }
  if (description === "") {
    DOM.previousSessionPopup.errors.description.textContent =
      "Description is required";
    showElement(DOM.previousSessionPopup.errors.description);
    isError = true;
  }
  if (date === "") {
    DOM.previousSessionPopup.errors.date.textContent = "Date is required";
    showElement(DOM.previousSessionPopup.errors.date);
    isError = true;
  }
  if (fromTime === "") {
    DOM.previousSessionPopup.errors.fromTime.textContent = "Required";
    showElement(DOM.previousSessionPopup.errors.fromTime);
    isError = true;
  }
  if (toTime === "") {
    DOM.previousSessionPopup.errors.toTime.textContent = "Required";
    showElement(DOM.previousSessionPopup.errors.toTime);
    isError = true;
  }

  if (link === "") {
    DOM.previousSessionPopup.errors.link.textContent = "Link is required";
    showElement(DOM.previousSessionPopup.errors.link);
    isError = true;
  }
  if (link && !/^https?:\/\//.test(link)) {
    DOM.previousSessionPopup.errors.link.textContent =
      "Enter a valid link starting with http:// or https://";
    showElement(DOM.previousSessionPopup.errors.link);
    isError = true;
  }
  if (isError) return;
  isError = false;

  if (rollno !== "") {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollno),
    );
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        hideSectionLoader();
        const data = snapshot.val();
        let isConfirm = await studentConfirmationPopup(Object.values(data)[0]);
        if (!isConfirm) {
          previousSessionsRollnoInput.value = "";
          previousSessionRollnoError.textContent = "Rollno required";
          isError = true;
        } else {
          userId = Object.values(data)[0].userId;
        }
      } else {
        isError = true;
        DOM.previousSessionPopup.errors.rollno.textContent = "Rollno not found";
        showElement(DOM.previousSessionPopup.errors.rollno);
        hideSectionLoader();
      }
    });
  }
  if (isError) return;
  if (isPreviousSessionEditing) {
    showSectionLoader("Updating session...");
    await updateData(
      `globalData/sessionData/previousSessionList/${selectedPreviousSessionId}`,
      {
        title,
        description,
        date,
        toTime: toTime,
        fromTime: fromTime,
        hostRollNumber: rollno,
        hostUserId: userId,
      },
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData("globalData/sessionData/previousSessionList", {
      title,
      description,
      date,
      fromTime: fromTime,
      toTime: toTime,
      rollNumber: rollno,
      hostUserId: userId,
      link,
    });
  }
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.previousSessionPopup.popup);
  resetPreviousSessionsPopup();
  await syncDbData();
  await loadSessionsSection();
  await hideSectionLoader();
  showSessionsSection();
});
DOM.previousSessionPopup.inputs.fromTime.addEventListener("click", () => {
  hideElement(DOM.previousSessionPopup.fakeTimeFromPlaceholder);
  DOM.previousSessionPopup.inputs.fromTime.showPicker();
});
DOM.previousSessionPopup.inputs.toTime.addEventListener("click", () => {
  hideElement(DOM.previousSessionPopup.fakeTimeToPlaceholder);
  DOM.previousSessionPopup.inputs.toTime.showPicker();
});
DOM.previousSessionPopup.fakeDatePlaceholder.addEventListener("click", () => {
  if (DOM.previousSessionPopup.inputs.date.showPicker) {
    DOM.previousSessionPopup.inputs.date.showPicker();
  } else {
    DOM.previousSessionPopup.inputs.date.focus();
  }
});
DOM.previousSessionPopup.inputs.title.addEventListener("input", () => {
  if (DOM.previousSessionPopup.inputs.title.value.length == 38) {
    DOM.previousSessionPopup.errors.title.textContent =
      "Max 32 characters reached";
    DOM.previousSessionPopup.inputs.title.value =
      DOM.previousSessionPopup.inputs.title.value.slice(0, 32);
    showElement(DOM.previousSessionPopup.errors.title);
  } else {
    hideElement(DOM.previousSessionPopup.errors.title);
  }
});
DOM.previousSessionPopup.inputs.description.addEventListener("input", () => {
  if (DOM.previousSessionPopup.inputs.description.value.length == 180) {
    DOM.previousSessionPopup.errors.description.textContent =
      "Max 155 characters reached";
    DOM.previousSessionPopup.inputs.description.value =
      DOM.previousSessionPopup.inputs.description.value.slice(0, 155);
    showElement(DOM.previousSessionPopup.errors.description);
  } else {
    hideElement(DOM.previousSessionPopup.errors.description);
  }
});
DOM.previousSessionPopup.inputs.rollno.addEventListener("input", () => {
  if (DOM.previousSessionPopup.inputs.rollno.value.length == 7) {
    DOM.previousSessionPopup.errors.rollno.textContent =
      "Roll number should 6 characters only";
    DOM.previousSessionPopup.inputs.rollno.value =
      DOM.previousSessionPopup.inputs.rollno.value.slice(0, 6);
    showElement(DOM.previousSessionPopup.errors.rollno);
  } else {
    hideElement(DOM.previousSessionPopup.errors.rollno);
  }
});
function resetPreviousSessionsPopup() {
  DOM.previousSessionPopup.inputs.title.value = "";
  DOM.previousSessionPopup.inputs.description.value = "";
  DOM.previousSessionPopup.inputs.rollno.value = "";
  DOM.previousSessionPopup.inputs.date.value = "";
  DOM.previousSessionPopup.inputs.fromTime.value = "";
  DOM.previousSessionPopup.inputs.toTime.value = "";
  DOM.previousSessionPopup.inputs.link.value = "";
  showElement(DOM.previousSessionPopup.fakeDatePlaceholder);
  showElement(DOM.previousSessionPopup.fakeTimeFromPlaceholder);
  showElement(DOM.previousSessionPopup.fakeTimeToPlaceholder);
  hideElement(DOM.previousSessionPopup.errors.link);
  hideElement(DOM.previousSessionPopup.deleteBtn);
  hideElement(DOM.previousSessionPopup.errors.title);
  hideElement(DOM.previousSessionPopup.errors.description);
  hideElement(DOM.previousSessionPopup.errors.rollno);
  hideElement(DOM.previousSessionPopup.errors.date);
  hideElement(DOM.previousSessionPopup.errors.fromTime);
  hideElement(DOM.previousSessionPopup.errors.toTime);
}
async function renderPreviousSession() {
  const data = appState?.globalData?.sessionData?.previousSessionList || {};
  if (!data || Object.keys(data).length === 0) {
    showElement(DOM.previousSessions.noPreviousSession);
    return;
  } else {
    hideElement(DOM.previousSessions.noPreviousSession);
  }
  for (const key in data) {
    const session = data[key];
    let { title, description, link, date, fromTime, toTime, hostUserId } =
      session;
    toTime = new Date("1970-01-01 " + toTime);
    fromTime = new Date("1970-01-01 " + fromTime);
    const duration = Math.round((toTime - fromTime) / (1000 * 60));
    const mentorData = await get(ref(db, `userData/${hostUserId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        }
        return null;
      })
      .catch((error) => {
        showErrorSection();
        return null;
      });

    if (!mentorData) continue;

    const name = `${mentorData.firstName} ${mentorData.lastName}`;
    const [sem, div] = mentorData.class.split("");
    const mentorClass = getFormattedClass(sem, div);
    const pfp = mentorData.pfpLink;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 flex flex-col gap-4 lg:gap-5 w-full rounded-3xl lg:max-w-[31.25rem] p-6 editor-hover-pointer";

    card.innerHTML = `
      <div class="wrapper w-full flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3 icon-name-wrapper">
          <img
            src="${pfp}"
            class="h-[2.75rem] w-[2.75rem] object-cover rounded-full"
            alt="Mentor"
          />
          <div class="wrapper">
            <p class="text-xl">${name.charAt(0).toUpperCase() + name.slice(1)}</p>
            <p class="text-xs text-text-tertiary">${mentorClass}</p>
          </div>
        </div>

      </div>
      <div class="wrapper flex flex-col gap-2">
        <p class="title text-xl font-semibold">${title.charAt(0).toUpperCase() + title.slice(1)}</p>
        <div class="description text-text-secondary">
          ${description.charAt(0).toUpperCase() + description.slice(1)}
        </div>
      </div>
      <div class="duration-date-wrapper text-xs font-light flex flex-col gap-1">
<p class="day">${formatDate(date)} at ${formatTime(toTime)}</p>
        <p class="duration">Duration : ${duration} mins</p>
      </div>
      <div><a href="${link}" target="_blank"><button class="button-hug mt-2">View session</button></a></div>
   
    `;
    DOM.previousSessions.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (!appState.isEditing) return;
      editPreviousSessionCard(key);
    });
  }
}
function editPreviousSessionCard(id) {
  showElement(DOM.previousSessionPopup.deleteBtn);
  isPreviousSessionEditing = true;
  selectedPreviousSessionId = id;
  DOM.previousSessionPopup.popupTitle.textContent = "Edit Session";
  const session = appState.globalData.sessionData.previousSessionList[id];
  DOM.previousSessionPopup.inputs.title.value = session.title;
  DOM.previousSessionPopup.inputs.description.value = session.description;
  DOM.previousSessionPopup.inputs.rollno.value = session.rollNumber;
  DOM.previousSessionPopup.inputs.link.value = session.link;
  DOM.previousSessionPopup.inputs.date.value = session.date;
  DOM.previousSessionPopup.inputs.toTime.value = session.toTime;
  DOM.previousSessionPopup.inputs.fromTime.value = session.fromTime;
  hideElement(DOM.previousSessionPopup.fakeDatePlaceholder);
  hideElement(DOM.previousSessionPopup.fakeTimeFromPlaceholder);
  hideElement(DOM.previousSessionPopup.fakeTimeToPlaceholder);
  fadeInEffect(DOM.previousSessionPopup.popup);
}
DOM.previousSessionPopup.deleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this session?",
  );
  if (isConfirmed) {
    showSectionLoader("Deleting session...");
    await deleteData(
      `globalData/sessionData/previousSessionList/${selectedPreviousSessionId}`,
    );
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.previousSessionPopup.popup);
    resetPreviousSessionsPopup();
    await syncDbData();
    await loadSessionsSection();
    await hideSectionLoader();
    showSessionsSection();
  }
});
function formatDate(dateString) {
  const dateObj = new Date(dateString);
  const now = new Date();

  // Remove time for accurate day comparison
  dateObj.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }

  // If date is within next 7 days (1–6)
  if (diffDays > 0 && diffDays < 7) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[dateObj.getDay()];
  }

  // Else return D-M-YY
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}
