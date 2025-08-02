const sessionsSection = document.querySelector(".sessions-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import {
  hideSections,
  hideSectionLoader,
  showSectionLoader,
  showConfirmationPopup,
} from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import {
  pushData,
  updateData,
  deleteData,
  query,
  get,
  child,
  ref,
  db,
  orderByChild,
  equalTo,
  app,
} from "./firebase.js";
import { appState, syncDbData } from "./appstate.js";
import { showErrorSection } from "./error.js";
export async function loadSessionsSection() {
  await unloadSessionsSection();
  await renderUpcomingSession();
  await renderPreviousSession();
}
export async function showSessionsSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/session.png?updatedAt=1753970178886";
  headerTitle.textContent = "Sessions";
  await hideSections();
  fadeInEffect(sessionsSection);
}
async function unloadSessionsSection() {
  await fadeOutEffect(sessionsSection);
  upcomingSessionsCardContainer.innerHTML = "";
  previousSessionsCardContainer.innerHTML = "";
}
//upcoming sessions
let isUpcomingSessionEditing = false;
let selectedUpcomingSessionId = null;
const upcomingSessions = document.querySelector(".upcoming-sessions");
const upcomingSessionsTitle = upcomingSessions.querySelector(
  ".upcoming-sessions .main-title"
);
const upcomingSessionsCardContainer = upcomingSessions.querySelector(
  ".upcoming-sessions .card-container"
);
const addUpcomingSessions = upcomingSessions.querySelector(".add-btn");
const noUpcomingSessions = upcomingSessions.querySelector(".no-sessions");
//popup
const upcomingSessionsPopup = document.querySelector(
  ".upcoming-session-popup-wrapper"
);
const upcomingSessionsPopupTitle = document.querySelector(".popup-title");
// buttons inside popup
const upcomingSessionsPopupCloseBtn =
  upcomingSessionsPopup.querySelector(".close-popup-btn");
const upcomingSessionsAddBtn =
  upcomingSessionsPopup.querySelector(".create-btn");
const upcomingSessionDeleteBtn =
  upcomingSessionsPopup.querySelector(".delete-btn");
// inputs

const upcomingSessionsTitleInput =
  upcomingSessionsPopup.querySelector(".title-input");
const upcomingSessionDescriptionInput =
  upcomingSessionsPopup.querySelector(".description-input");
const upcomingSessionsRollnoInput =
  upcomingSessionsPopup.querySelector(".rollno-input");
const upcomingSessionsLinkInput =
  upcomingSessionsPopup.querySelector(".link-input");
const upcomingSessionsDateInput =
  upcomingSessionsPopup.querySelector(".date-input");
const upcomingSessionsTimeInput =
  upcomingSessionsPopup.querySelector(".time-input");
const upcomingSessionDurationInput =
  upcomingSessionsPopup.querySelector(".duration-input");
// errors
const upcomingSessionTitleError = upcomingSessionsPopup.querySelector(
  ".title-related-error"
);
const upcomingSessionDescriptionError = upcomingSessionsPopup.querySelector(
  ".description-related-error"
);
const upcomingSessionRollnoError = upcomingSessionsPopup.querySelector(
  ".rollno-related-error"
);
const upcomingSessionLinkError = upcomingSessionsPopup.querySelector(
  ".link-related-error"
);
const upcomingSessionDateError = upcomingSessionsPopup.querySelector(
  ".date-related-error"
);
const upcomingSessionTimeError = upcomingSessionsPopup.querySelector(
  ".time-related-error"
);
const upcomingSessionDurationError = upcomingSessionsPopup.querySelector(
  ".duration-related-error"
);
const upcomingSessionDateFakePlaceholder =
  upcomingSessionsPopup.querySelector(".fake-placeholder");
addUpcomingSessions.addEventListener("click", () => {
  fadeInEffect(upcomingSessionsPopup);
});
upcomingSessionsPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(upcomingSessionsPopup);
  resetUpcomingSessionsPopup();
});
upcomingSessionsDateInput.addEventListener("input", () => {
  upcomingSessionDateFakePlaceholder.focus();
  fadeOutEffect(upcomingSessionDateFakePlaceholder);
});
upcomingSessionsDateInput.addEventListener("click", () => {
  if (upcomingSessionsDateInput.showPicker) {
    upcomingSessionsDateInput.showPicker();
  } else {
    upcomingSessionsDateInput.focus();
  }
});
upcomingSessionsAddBtn.addEventListener("click", async () => {
  fadeOutEffect(upcomingSessionTitleError);
  fadeOutEffect(upcomingSessionDescriptionError);
  fadeOutEffect(upcomingSessionLinkError);
  fadeOutEffect(upcomingSessionDateError);
  fadeOutEffect(upcomingSessionTimeError);
  fadeOutEffect(upcomingSessionDurationError);
  const title = upcomingSessionsTitleInput.value.trim();
  const description = upcomingSessionDescriptionInput.value.trim();
  const link = upcomingSessionsLinkInput.value.trim();
  const date = upcomingSessionsDateInput.value.trim();
  const time = upcomingSessionsTimeInput.value.trim();
  const rollnoInput = upcomingSessionsRollnoInput.value.trim();
  const rollno = Number(rollnoInput);
  const duration = upcomingSessionDurationInput.value.trim();
  let userId;
  let isError;
  if (rollnoInput === "" || isNaN(rollno)) {
    upcomingSessionRollnoError.textContent =
      "Rollno is required and must be a number";
    fadeInEffect(upcomingSessionRollnoError);
    isError = true;
  }
  if (title === "") {
    upcomingSessionTitleError.textContent = "Title is required";
    fadeInEffect(upcomingSessionTitleError);
    isError = true;
  }
  if (description === "") {
    upcomingSessionDescriptionError.textContent = "Description is required";
    fadeInEffect(upcomingSessionDescriptionError);
    isError = true;
  }
  if (rollno === "") {
    upcomingSessionRollnoError.textContent = "Rollno is required";
    fadeInEffect(upcomingSessionRollnoError);
    isError = true;
  }
  if (date === "") {
    upcomingSessionDateError.textContent = "Date is required";
    fadeInEffect(upcomingSessionDateError);
    isError = true;
  }
  if (time === "") {
    upcomingSessionTimeError.textContent = "Time is required";
    fadeInEffect(upcomingSessionTimeError);
    isError = true;
  }
  if (duration === "") {
    upcomingSessionDurationError.textContent = "Duration is required";
    fadeInEffect(upcomingSessionDurationError);
    isError = true;
  }
  if (link) {
    if (!/^https?:\/\//.test(link)) {
      upcomingSessionLinkError.textContent = "Invalid link";
      fadeInEffect(upcomingSessionLinkError);
      isError = true;
    }
  }
  if (isError) return;
  isError = false;
  if (rollno !== "") {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollno)
    );
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        hideSectionLoader();
        const data = snapshot.val();
        let isConfirm = await studentConfirmationPopup(Object.values(data)[0]);
        if (!isConfirm) {
          upcomingSessionsRollnoInput.value = "";
          upcomingSessionRollnoError.textContent = "Rollno required";
          isError = true;
        } else {
          userId = Object.values(data)[0].userId;
        }
      } else {
        isError = true;
        upcomingSessionRollnoError.textContent = "Rollno not found";
        fadeInEffect(upcomingSessionRollnoError);
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
        time: time,
        duration: duration,
        hostRollNumber: rollno,
        hostUserId: userId,
      }
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData(`globalData/sessionData/upcomingSessionList`, {
      title: title,
      description: description,
      link: link,
      date: date,
      time: time,
      duration: duration,
      hostRollNumber: rollno,
      hostUserId: userId,
    });
  }
  showSectionLoader("Syncing data...");
  await fadeOutEffect(upcomingSessionsPopup);
  resetUpcomingSessionsPopup();
  await syncDbData();
  hideSectionLoader();
  await loadSessionsSection();
  showSessionsSection();
});
upcomingSessionDeleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this session?"
  );
  if (isConfirmed) {
    showSectionLoader("Deleting session...");
    await deleteData(
      `globalData/sessionData/upcomingSessionList/${selectedUpcomingSessionId}`
    );
    showSectionLoader("Syncing data...");
    await fadeOutEffect(upcomingSessionsPopup);
    resetUpcomingSessionsPopup();
    await syncDbData();
    hideSectionLoader();
    loadSessionsSection();
    showSessionsSection();
  }
});
async function studentConfirmationPopup(data) {
  return new Promise((resolve) => {
    const confirmationPopup = document.querySelector(
      ".sessions-section .confirmation-popup-wrapper"
    );
    const confirmationRollno = document.querySelector(
      ".confirmation-popup .rollno"
    );
    const confirmationName = document.querySelector(
      ".confirmation-popup .name"
    );
    const confirmationSem = document.querySelector(".confirmation-popup .sem");
    const confirmationDiv = document.querySelector(".confirmation-popup .div");
    const confirmButton = confirmationPopup.querySelector(
      ".confirmation-popup .confirm-btn"
    );
    const cancelButton = confirmationPopup.querySelector(
      ".confirmation-popup .cancel-btn"
    );

    confirmationRollno.textContent = `Roll no : ${data.rollNumber}`;
    confirmationName.textContent = `${data.firstName} ${data.lastName}`;
    confirmationSem.textContent = `Semester : ${data.semester}`;
    confirmationDiv.textContent = `Division : ${data.division}`;
    fadeInEffect(confirmationPopup);
    confirmButton.addEventListener("click", async () => {
      fadeOutEffect(confirmationPopup);
      resolve(true);
    });
    cancelButton.addEventListener("click", async () => {
      await fadeOutEffect(confirmationPopup);
      resolve(false);
    });
  });
}
function resetUpcomingSessionsPopup() {
  upcomingSessionsTitleInput.value = "";
  upcomingSessionDescriptionInput.value = "";
  upcomingSessionsRollnoInput.value = "";
  upcomingSessionsLinkInput.value = "";
  upcomingSessionsDateInput.value = "";
  upcomingSessionsTimeInput.value = "";
  upcomingSessionDurationInput.value = "";
  fadeOutEffect(upcomingSessionDeleteBtn);

  fadeInEffect(upcomingSessionDateFakePlaceholder);
  fadeOutEffect(upcomingSessionTitleError);
  fadeOutEffect(upcomingSessionDescriptionError);
  fadeOutEffect(upcomingSessionRollnoError);
  fadeOutEffect(upcomingSessionLinkError);
  fadeOutEffect(upcomingSessionDateError);
  fadeOutEffect(upcomingSessionTimeError);
  fadeOutEffect(upcomingSessionDurationError);
}
async function renderUpcomingSession() {
  let isLink = false;
  const data = appState?.globalData?.sessionData?.upcomingSessionList || {};
  console.log("Upcoming sessions data:", data);

  if (!data || Object.keys(data).length === 0) {
    fadeInEffect(noUpcomingSessions);
    return;
  } else fadeOutEffect(noUpcomingSessions);
  for (const key in data) {
    const session = data[key];
    const { title, description, link, date, time, duration, hostUserId } =
      session;
    if (link) isLink = true;

    const mentorData = await get(ref(db, `userData/${hostUserId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        }
        console.error("No mentor data available");
      })
      .catch((error) => {
        console.error("Error fetching mentor data:", error);
        showErrorSection();
        return;
      });

    if (!mentorData) continue;
    const name = `${mentorData.firstName} ${mentorData.lastName}`;
    const mentorClass = getFormattedClass(
      mentorData.semester,
      mentorData.division
    );
    const pfp = mentorData.pfpLink;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 flex flex-col gap-4 lg:gap-5 w-full rounded-3xl lg:max-w-[500px] p-6";

    card.innerHTML = `
      <div class="wrapper w-full flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3 icon-name-wrapper">
          <img
            src="${pfp}"
            class="h-[45px] w-[45px] object-cover rounded-full"
            alt="Mentor"
          />
          <div class="wrapper">
            <p class="text-xl">${name}</p>
            <p class="text-xs text-text-tertiary">${mentorClass}</p>
          </div>
        </div>
        ${
          link
            ? `<div><a href="${link}" target="_blank"><button class="button-hug mt-2">Join</button></a></div>`
            : `<p class="status text-xs text-text-link">Coming soon</p>`
        }

      </div>
      <div class="wrapper flex flex-col gap-2">
        <p class="title text-xl font-semibold">${title}</p>
        <div class="description text-text-secondary">
          ${description}
        </div>
      </div>
      <div class="duration-date-wrapper text-xs font-light flex flex-col gap-1">
<p class="day">${formatDate(date)} at ${time}</p>
        <p class="duration">Duration : ${duration}</p>
      </div>
   
    `;
    upcomingSessionsCardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (!appState.isEditing) return;
      editUpcomingSessionCard(key);
    });
  }
  if (isLink) upcomingSessionsTitle.textContent = "Current ongoing Sessions";
  else upcomingSessionsTitle.textContent = "Upcoming Sessions";
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
function editUpcomingSessionCard(id) {
  isUpcomingSessionEditing = true;
  selectedUpcomingSessionId = id;
  upcomingSessionsPopupTitle.textContent = "Edit Session";
  const session = appState.globalData.sessionData.upcomingSessionList[id];
  upcomingSessionsTitleInput.value = session.title;
  upcomingSessionDescriptionInput.value = session.description;
  upcomingSessionsRollnoInput.value = session.hostRollNumber;
  upcomingSessionsLinkInput.value = session.link;
  upcomingSessionsDateInput.value = session.date;
  upcomingSessionsTimeInput.value = session.time;
  upcomingSessionDurationInput.value = session.duration;
  fadeInEffect(upcomingSessionDeleteBtn);
  fadeOutEffect(upcomingSessionDateFakePlaceholder);
  fadeInEffect(upcomingSessionsPopup);
}

//previous sessions
// ===== STATE =====
let isPreviousSessionEditing = false;
let selectedPreviousSessionId = null;
const previousSessions = document.querySelector(".previous-sessions");
const previousSessionsCardContainer =
  previousSessions.querySelector(".card-container");
const addPreviousSessionBtn = previousSessions.querySelector(".add-btn");
const previousSessionsPopup = document.querySelector(
  ".previous-session-popup-wrapper"
);
const previousSessionsPopupTitle =
  previousSessionsPopup.querySelector(".popup-title");
const noPreviousSessions = previousSessions.querySelector(
  ".no-previous-sessions"
);
// btn insider popup
const previousSessionsPopupCloseBtn =
  previousSessionsPopup.querySelector(".close-popup-btn");
const previousSessionsAddBtn =
  previousSessionsPopup.querySelector(".create-btn");
// Inputs
const previousSessionsTitleInput =
  previousSessionsPopup.querySelector(".title-input");
const previousSessionsDescriptionInput =
  previousSessionsPopup.querySelector(".description-input");
const previousSessionsRollnoInput =
  previousSessionsPopup.querySelector(".rollno-input");
const previousSessionsDateInput =
  previousSessionsPopup.querySelector(".date-input");
const previousSessionsTimeInput =
  previousSessionsPopup.querySelector(".time-input");
const previousSessionsDurationInput =
  previousSessionsPopup.querySelector(".duration-input");
const previousSessionsLinkInput =
  previousSessionsPopup.querySelector(".link-input");
// Errors
const previousSessionTitleError = previousSessionsPopup.querySelector(
  ".title-related-error"
);
const previousSessionDescriptionError = previousSessionsPopup.querySelector(
  ".description-related-error"
);
const previousSessionRollnoError = previousSessionsPopup.querySelector(
  ".rollno-related-error"
);
const previousSessionDateError = previousSessionsPopup.querySelector(
  ".date-related-error"
);
const previousSessionTimeError = previousSessionsPopup.querySelector(
  ".time-related-error"
);
const previousSessionDurationError = previousSessionsPopup.querySelector(
  ".duration-related-error"
);
const previousSessionLinkError = previousSessionsPopup.querySelector(
  ".link-related-error"
);
const previousSessionDateFakePlaceholder =
  previousSessionsPopup.querySelector(".fake-placeholder");
const previousSessionDeleteBtn =
  previousSessionsPopup.querySelector(".delete-btn");
previousSessionsDateInput.addEventListener("input", () => {
  previousSessionsDateInput.focus();
  fadeOutEffect(previousSessionDateFakePlaceholder);
});
previousSessionsDateInput.addEventListener("click", () => {
  if (previousSessionsDateInput.showPicker) {
    previousSessionsDateInput.showPicker();
  } else {
    previousSessionsDateInput.focus();
  }
});
addPreviousSessionBtn.addEventListener("click", () => {
  fadeInEffect(previousSessionsPopup);
});
previousSessionsPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(previousSessionsPopup);
  resetPreviousSessionsPopup();
});
previousSessionsAddBtn.addEventListener("click", async () => {
  fadeOutEffect(previousSessionTitleError);
  fadeOutEffect(previousSessionDescriptionError);
  fadeOutEffect(previousSessionRollnoError);
  fadeOutEffect(previousSessionDateError);
  fadeOutEffect(previousSessionTimeError);
  fadeOutEffect(previousSessionDurationError);
  fadeOutEffect(previousSessionLinkError);
  const title = previousSessionsTitleInput.value.trim();
  const description = previousSessionsDescriptionInput.value.trim();
  const rollnoInput = previousSessionsRollnoInput.value.trim();
  const date = previousSessionsDateInput.value.trim();
  const time = previousSessionsTimeInput.value.trim();
  const duration = previousSessionsDurationInput.value.trim();
  const link = previousSessionsLinkInput.value.trim();
  const rollno = Number(rollnoInput);
  let userId;
  let isError;
  if (rollnoInput === "" || isNaN(rollno)) {
    previousSessionRollnoError.textContent =
      "Rollno is required and must be a number";
    fadeInEffect(previousSessionRollnoError);
    isError = true;
  }
  if (title === "") {
    previousSessionTitleError.textContent = "Title is required";
    fadeInEffect(previousSessionTitleError);
    isError = true;
  }
  if (description === "") {
    previousSessionDescriptionError.textContent = "Description is required";
    fadeInEffect(previousSessionDescriptionError);
    isError = true;
  }
  if (date === "") {
    previousSessionDateError.textContent = "Date is required";
    fadeInEffect(previousSessionDateError);
    isError = true;
  }
  if (time === "") {
    previousSessionTimeError.textContent = "Time is required";
    fadeInEffect(previousSessionTimeError);
    isError = true;
  }
  if (duration === "") {
    previousSessionDurationError.textContent = "Duration is required";
    fadeInEffect(previousSessionDurationError);
    isError = true;
  }
  if (link === "") {
    previousSessionLinkError.textContent = "Link is required";
    fadeInEffect(previousSessionLinkError);
    isError = true;
  }
  if (link && !/^https?:\/\//.test(link)) {
    previousSessionLinkError.textContent =
      "Enter a valid link starting with http:// or https://";
    fadeInEffect(previousSessionLinkError);
    isError = true;
  }
  if (isError) return;
  isError = false;

  if (rollno !== "") {
    showSectionLoader("Checking rollno...");
    const q = query(
      ref(db, "userData"),
      orderByChild("rollNumber"),
      equalTo(rollno)
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
        previousSessionRollnoError.textContent = "Rollno not found";
        fadeInEffect(previousSessionRollnoError);
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
        time,
        duration,
        rollNumber: rollno,
        hostUserId: userId,
      }
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData("globalData/sessionData/previousSessionList", {
      title,
      description,
      date,
      time,
      duration,
      rollNumber: rollno,
      hostUserId: userId,
      link,
    });
  }
  showSectionLoader("Syncing data...");
  await fadeOutEffect(previousSessionsPopup);
  resetPreviousSessionsPopup();
  await syncDbData();
  hideSectionLoader();
  await loadSessionsSection();
  showSessionsSection();
});

function resetPreviousSessionsPopup() {
  previousSessionsTitleInput.value = "";
  previousSessionsDescriptionInput.value = "";
  previousSessionsRollnoInput.value = "";
  previousSessionsDateInput.value = "";
  previousSessionsTimeInput.value = "";
  previousSessionsDurationInput.value = "";
  fadeOutEffect(previousSessionLinkError);
  fadeOutEffect(previousSessionDeleteBtn);
  fadeInEffect(previousSessionDateFakePlaceholder);
  fadeOutEffect(previousSessionTitleError);
  fadeOutEffect(previousSessionDescriptionError);
  fadeOutEffect(previousSessionRollnoError);
  fadeOutEffect(previousSessionDateError);
  fadeOutEffect(previousSessionTimeError);
  fadeOutEffect(previousSessionDurationError);
}
async function renderPreviousSession() {
  const data = appState?.globalData?.sessionData?.previousSessionList || {};
  if (!data || Object.keys(data).length === 0) {
    fadeInEffect(noPreviousSessions);
    return;
  } else fadeOutEffect(noPreviousSessions);
  for (const key in data) {
    const session = data[key];

    const { title, description, link, date, time, duration, hostUserId } =
      session;
    const mentorData = await get(ref(db, `userData/${hostUserId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        }
        return null;
      })
      .catch((error) => {
        console.error("Error fetching mentor data:", error);
        return null;
      });

    if (!mentorData) continue;

    const name = `${mentorData.firstName} ${mentorData.lastName}`;
    const mentorClass = getFormattedClass(
      mentorData.semester,
      mentorData.division
    );
    const pfp = mentorData.pfpLink;
    const card = document.createElement("div");
    card.className =
      "card bg-surface-2 flex flex-col gap-4 lg:gap-5 w-full rounded-3xl lg:max-w-[500px] p-6";

    card.innerHTML = `
      <div class="wrapper w-full flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3 icon-name-wrapper">
          <img
            src="${pfp}"
            class="h-[45px] w-[45px] object-cover rounded-full"
            alt="Mentor"
          />
          <div class="wrapper">
            <p class="text-xl">${name}</p>
            <p class="text-xs text-text-tertiary">${mentorClass}</p>
          </div>
        </div>

      </div>
      <div class="wrapper flex flex-col gap-2">
        <p class="title text-xl font-semibold">${title}</p>
        <div class="description text-text-secondary">
          ${description}
        </div>
      </div>
      <div class="duration-date-wrapper text-xs font-light flex flex-col gap-1">
<p class="day">${formatDate(date)} at ${time}</p>
        <p class="duration">Duration : ${duration}</p>
      </div>
      <div><a href="${link}" target="_blank"><button class="button-hug mt-2">View session</button></a></div>
   
    `;
    previousSessionsCardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (!appState.isEditing) return;
      editPreviousSessionCard(key);
    });
  }
}

function editPreviousSessionCard(id) {
  fadeInEffect(previousSessionDeleteBtn);
  isPreviousSessionEditing = true;
  selectedPreviousSessionId = id;
  previousSessionsPopupTitle.textContent = "Edit Session";
  const session = appState.globalData.sessionData.previousSessionList[id];
  previousSessionsTitleInput.value = session.title;
  previousSessionsDescriptionInput.value = session.description;
  previousSessionsRollnoInput.value = session.rollNumber;
  previousSessionsLinkInput.value = session.link;
  previousSessionsDateInput.value = session.date;
  previousSessionsTimeInput.value = session.time;
  previousSessionsDurationInput.value = session.duration;
  fadeOutEffect(previousSessionDateFakePlaceholder);
  fadeInEffect(previousSessionsPopup);
}
previousSessionDeleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this session?"
  );
  if (isConfirmed) {
    showSectionLoader("Deleting session...");
    await deleteData(
      `globalData/sessionData/previousSessionList/${selectedPreviousSessionId}`
    );
    showSectionLoader("Syncing data...");
    await fadeOutEffect(previousSessionsPopup);
    resetPreviousSessionsPopup();
    await syncDbData();
    hideSectionLoader();
    await loadSessionsSection();
    showSessionsSection();
  }
});
function formatDate(dateString) {
  const dateObj = new Date(dateString);
  const now = new Date();

  // Calculate difference in days
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If date is within next 7 days (0–6)
  if (diffDays >= 0 && diffDays < 7) {
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
