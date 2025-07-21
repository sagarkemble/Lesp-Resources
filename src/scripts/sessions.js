const sessionsSection = document.querySelector(".sessions-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections, hideSectionLoader, showSectionLoader } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import {
  pushData,
  updateData,
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
let testData;
export async function loadSessionsSection() {
  await unloadSessionsSection();
  renderUpcomingSession();
  renderPreviousSession();
}
export async function showSessionsSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/image.png?updatedAt=1751906213435";
  headerTitle.textContent = "Sessions";
  await hideSections();
  fadeInEffect(sessionsSection);
}
function unloadSessionsSection() {
  fadeOutEffect(sessionsSection);
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
//popup
const upcomingSessionsPopup = document.querySelector(
  ".upcoming-session-popup-wrapper"
);
const upcomingSessionsPopupTitle = document.querySelector(".popup-title");
const upcomingSessionsPopupCloseBtn =
  upcomingSessionsPopup.querySelector(".close-popup-btn");
const upcomingSessionsAddBtn =
  upcomingSessionsPopup.querySelector(".create-btn");
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
const upcomingSessionDeleteBtn =
  upcomingSessionsPopup.querySelector(".delete-btn");
addUpcomingSessions.addEventListener("click", () => {
  fadeInEffect(upcomingSessionsPopup);
});
upcomingSessionsPopupCloseBtn.addEventListener("click", () => {
  fadeOutEffect(upcomingSessionsPopup);
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
  let userId;
  if (rollnoInput === "" || isNaN(rollno)) {
    upcomingSessionRollnoError.textContent =
      "Rollno is required and must be a number";
    fadeInEffect(upcomingSessionRollnoError);
    isError = true;
  }
  const duration = upcomingSessionDurationInput.value.trim();
  let isError;
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
    const q = query(ref(db, "users"), orderByChild("rollNo"), equalTo(rollno));
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        hideSectionLoader();
        const data = snapshot.val();
        let isConfirm = await confirmationPopup(Object.values(data)[0]);
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
      `globalData/sessions/upcomingSessions/${selectedUpcomingSessionId}`,
      {
        title: title,
        description: description,
        link: link,
        date: date,
        time: time,
        duration: duration,
        rollno: rollno,
        userId: userId,
      }
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData(`globalData/sessions/upcomingSessions`, {
      title: title,
      description: description,
      link: link,
      date: date,
      time: time,
      duration: duration,
      rollno: rollno,
      userId: userId,
    });
  }
  hideSectionLoader();
  fadeOutEffect(upcomingSessionsPopup);
  resetUpcomingSessionsPopup();
  syncDbData();
  loadSessionsSection();
});
upcomingSessionDeleteBtn.addEventListener("click", async () => {});
async function confirmationPopup(data) {
  console.log(data);

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

    confirmationRollno.textContent = data.rollno;
    confirmationName.textContent = `${data.firstName} ${data.lastName}`;
    confirmationSem.textContent = data.sem;
    confirmationDiv.textContent = data.div;
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
  const data = appState.globalData.sessions.upcomingSessions;
  for (const key in data) {
    const session = data[key];

    const { title, description, link, date, time, duration, userId } = session;

    // Get mentor data from DB
    const mentorData = await get(ref(db, `users/${userId}`))
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
    const mentorClass = getFormattedClass(mentorData.sem, mentorData.div);
    const pfp = mentorData.pfp;

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
}
function getFormattedClass(sem, div) {
  const semMap = {
    "semester-1": "FYCO",
    "semester-2": "FYCO",
    "semester-3": "SYCO",
    "semester-4": "SYCO",
    "semester-5": "TYCO",
    "semester-6": "TYCO",
  };

  const formattedSem = semMap[sem] || sem;
  const formattedDiv = div.replace("div-", "").toUpperCase();

  return `${formattedSem}-${formattedDiv}`;
}
function editUpcomingSessionCard(id) {
  isUpcomingSessionEditing = true;
  selectedUpcomingSessionId = id;
  upcomingSessionsPopupTitle.textContent = "Edit Session";
  const session = appState.globalData.sessions.upcomingSessions[id];
  upcomingSessionsTitleInput.value = session.title;
  upcomingSessionDescriptionInput.value = session.description;
  upcomingSessionsRollnoInput.value = session.rollno;
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

// ===== ELEMENTS =====
const previousSessions = document.querySelector(".previous-sessions");
const previousSessionsCardContainer =
  previousSessions.querySelector(".card-container");
const addPreviousSessionBtn = previousSessions.querySelector(".add-btn");

const previousSessionsPopup = document.querySelector(
  ".previous-session-popup-wrapper"
);
const previousSessionsPopupTitle =
  previousSessionsPopup.querySelector(".popup-title");
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

previousSessionsPopupCloseBtn.addEventListener("click", () => {
  fadeOutEffect(previousSessionsPopup);
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
    const q = query(ref(db, "users"), orderByChild("rollNo"), equalTo(rollno));
    await get(q).then(async (snapshot) => {
      if (snapshot.exists()) {
        hideSectionLoader();
        const data = snapshot.val();
        let isConfirm = await confirmationPopup(Object.values(data)[0]);
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
      `globalData/sessions/previousSessions/${selectedPreviousSessionId}`,
      {
        title,
        description,
        date,
        time,
        duration,
        rollno,
        userId,
      }
    );
  } else {
    showSectionLoader("Adding session...");
    await pushData("globalData/sessions/previousSessions", {
      title,
      description,
      date,
      time,
      duration,
      rollno,
      userId,
      link,
    });
  }

  hideSectionLoader();
  fadeOutEffect(previousSessionsPopup);
  resetPreviousSessionsPopup();
  syncDbData();
  loadSessionsSection();
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
  const data = appState.globalData.sessions.previousSessions;
  for (const key in data) {
    const session = data[key];

    const { title, description, link, date, time, duration, userId } = session;
    const mentorData = await get(ref(db, `users/${userId}`))
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
    const mentorClass = getFormattedClass(mentorData.sem, mentorData.div);
    const pfp = mentorData.pfp;

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
  const session = appState.globalData.sessions.previousSessions[id];
  previousSessionsTitleInput.value = session.title;
  previousSessionsDescriptionInput.value = session.description;
  previousSessionsRollnoInput.value = session.rollno;
  previousSessionsLinkInput.value = session.link;
  previousSessionsDateInput.value = session.date;
  previousSessionsTimeInput.value = session.time;
  previousSessionsDurationInput.value = session.duration;
  fadeOutEffect(previousSessionDateFakePlaceholder);
  fadeInEffect(previousSessionsPopup);
}
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
