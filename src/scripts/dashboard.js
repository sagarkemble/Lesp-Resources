import { appState, syncDbData } from "./appstate.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import {
  hideSections,
  showSectionLoader,
  hideSectionLoader,
  showConfirmationPopup,
  applyEditModeUI,
} from "./index.js";
import { deleteDriveFile, uploadDriveFile } from "./driveApi.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { pfpSelectionPopup } from "./iconLibrary.js";
import {
  app,
  pushData,
  get,
  ref,
  db,
  updateData,
  deleteData,
  signOutUser,
  set,
} from "./firebase.js";
const timetableSwiper = new Swiper("#time-table-swiper", {
  direction: "horizontal",
  loop: true,
  slidesPerView: 1,
  spaceBetween: 30,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
const dashboardSection = document.querySelector(".dashboard-section");
// upcoming submission
const upcomingSubmission = dashboardSection.querySelector(
  ".upcoming-submissions"
);
const upcomingSubmissionCardContainer = upcomingSubmission.querySelector(
  ".upcoming-submissions .card-container"
);
function renderUpcomingSubmissions() {
  const upcomingSubmissions = appState?.divisionData?.upcomingSubmissionData;
  if (!upcomingSubmissions || Object.keys(upcomingSubmissions).length === 0) {
    console.log("No upcoming submissions found from dashboard.");
    return;
  }
  const subjectMetaData = appState.subjectMetaData;
  for (const key in upcomingSubmissions) {
    const subject = upcomingSubmissions[key];
    const subjectName = subjectMetaData[key].name;
    const subjectIcon = subjectMetaData[key].iconLink;
    for (const key2 in subject) {
      const submission = subject[key2];
      const card = document.createElement("div");
      card.classList.add(
        "card",
        "p-4",
        "bg-surface-2",
        "rounded-[20px]",
        "flex",
        "flex-col",
        "lg:gap-3",
        "py-5"
      );
      card.innerHTML = `
       <div class="wrapper flex items-center gap-1 lg:gap-3 pt-1 ">
                <img
                  src="${subjectIcon}"
                  alt=""
                  class="w-[25px] h-[25px] lg:w-[40px] lg:h-[40px]"
                />
                <p class="subject-name font-semibold text-text-primary">${subjectName}</p>
              </div>
              <div class="wrapper flex flex-col lg:gap-1 text-text-secondary">
                <p class="description">${submission.name}</p>
                <p class="submission-date">${submission.dueDate}</p>
              </div>
      `;
      upcomingSubmissionCardContainer.appendChild(card);
    }
  }
}

// notice section
const noticeSwiper = new Swiper("#dashboard-notice-swiper", {
  direction: "horizontal",
  slidesPerView: "auto",
  spaceBetween: 30,
  loop: false,
  centeredSlides: true,
  watchOverflow: true,
  breakpoints: {
    768: {
      centeredSlides: false,
    },
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  observer: true,
  observeParents: true,
});
const noticeSwiperWrapper = document.querySelector(
  "#dashboard-notice-swiper .swiper-wrapper"
);
const addNoticeBtn = dashboardSection.querySelector(".add-notice-btn");
const addNoticePopup = dashboardSection.querySelector(
  ".add-notice-popup-wrapper"
);
const addNoticePopupcloseBtn = addNoticePopup.querySelector(".close-popup-btn");
const addNoticePopupcreateBtn = addNoticePopup.querySelector(".create-btn");
//inputs
const addNoticeTitleInput = addNoticePopup.querySelector(".title-input");
const addNoticefileInput = addNoticePopup.querySelector(".file-input");
const addNoticeDescriptionInput =
  addNoticePopup.querySelector(".description-input");
const addNoticeLinkInput = addNoticePopup.querySelector(".link-input");
const addNoticeScopeInput = addNoticePopup.querySelector(".scope-input");
// error msgs
const addNoticePopupLinkError = addNoticePopup.querySelector(
  ".link-related-error"
);
const addNoticePopuptitleError = addNoticePopup.querySelector(
  ".title-related-error"
);
const addNoticePopupdescriptionError = addNoticePopup.querySelector(
  ".description-related-error"
);
const addNoticePopupScopeError = addNoticePopup.querySelector(
  ".scope-related-error"
);
// file attachment ui
const addNoticeFileAttachment =
  addNoticePopup.querySelector(".file-attachment");
const addNotivePopupFileAttachmentText =
  addNoticePopup.querySelector(".upload-text");
const addNoticePopupFileAttachmentIcon = addNoticePopup.querySelector(
  ".file-attachment-icon"
);
// error popup
const addNoticePopupErrorPopup = addNoticePopup.querySelector(
  ".error-popup-wrapper"
);
const addNoticePopupErrorPopupOkayBtn =
  addNoticePopupErrorPopup.querySelector(".okay-btn");
let selectedNotice;
// others
const addNoticeTypePlaceholder =
  addNoticePopup.querySelector(".scope-placeholder");

addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(addNoticePopup);
});
addNoticePopupcloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(addNoticePopup);
  resetAddNoticePopup();
});
addNoticeScopeInput.addEventListener("change", () => {
  fadeOutEffect(addNoticeTypePlaceholder);
});
addNoticefileInput.addEventListener("change", () => {
  const file = addNoticefileInput.files[0];
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      addNoticefileInput.value = "";
      addNoticePopupLinkError.textContent = "File too large (max 20MB)";
      fadeInEffect(addNoticePopupLinkError);
      fadeInEffect(addNoticePopupFileAttachmentIcon);
      return;
    }
    fadeOutEffect(addNoticePopupFileAttachmentIcon);
    addNotivePopupFileAttachmentText.textContent = "1 file attached";
  } else {
    fadeInEffect(addNoticePopupFileAttachmentIcon);
    addNotivePopupFileAttachmentText.textContent = "Upload (Optional)";
  }
});
addNoticeFileAttachment.addEventListener("click", () => {
  addNoticefileInput.click();
});
addNoticePopupErrorPopupOkayBtn.addEventListener("click", async () => {
  await fadeOutEffect(addNoticePopup);
  fadeOutEffect(addNoticePopupErrorPopup);
  resetAddNoticePopup();
});
addNoticePopupcreateBtn.addEventListener("click", async () => {
  const title = addNoticeTitleInput.value.trim();
  const description = addNoticeDescriptionInput.value.trim();
  const file = addNoticefileInput.files[0];
  const type = addNoticeScopeInput.value;
  console.log(type);

  fadeOutEffect(addNoticePopuptitleError);
  fadeOutEffect(addNoticePopupdescriptionError);
  fadeOutEffect(addNoticePopupLinkError);
  fadeOutEffect(addNoticePopupScopeError);
  const link = addNoticeLinkInput.value.trim();
  fadeOutEffect(addNoticePopupLinkError);
  let hasError = false;
  if (!title) {
    addNoticePopuptitleError.textContent = "Title is required";
    fadeInEffect(addNoticePopuptitleError);
    hasError = true;
  }
  if (!type) {
    addNoticePopupScopeError.textContent = "Scope is required";
    fadeInEffect(addNoticePopupScopeError);
    hasError = true;
  }
  if (!description) {
    addNoticePopupdescriptionError.textContent = "Description is required";
    fadeInEffect(addNoticePopupdescriptionError);
    hasError = true;
  }
  if (!file && link && !/^https?:\/\//.test(link)) {
    addNoticePopupLinkError.textContent =
      "Enter a valid link starting with http:// or https://";
    fadeInEffect(addNoticePopupLinkError);
    hasError = true;
  }
  if (file && link) {
    fadeInEffect(addNoticePopupErrorPopup);
    return;
  }
  if (hasError) return;
  let attachmentURL = "";
  let attachmentId = "";
  showSectionLoader("Uploading attachment...");
  if (file) {
    let uploaded;

    if (type === "department") {
      console.log("Uploading file to Drive...");
      uploaded = await uploadDriveFile(file, `resources/globalData/notices`);
    } else if (type === "division") {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/${appState.activeDiv}/divisionData/notices`
      );
    } else if (type === "semester") {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/semesterData/notices`
      );
    } else {
      uploaded = await uploadDriveFile(
        file,
        `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/notices`
      );
    }
    if (!uploaded) return;
    attachmentURL = uploaded.webViewLink;
    attachmentId = uploaded.fileId;
  } else if (link) {
    attachmentURL = link;
    attachmentId = "custom-link";
  }
  showSectionLoader("Adding notice...");
  const obj = {
    attachmentURL,
    attachmentId,
    title,
    description,
    createdAt: Date.now(),
    scope: type,
  };
  if (type === "department") {
    await pushData(`globalData/noticeList`, obj);
  } else if (type === "division") {
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/divisionNoticeList`,
      obj
    );
  } else if (type === "semester") {
    await pushData(
      `semesterList/${appState.activeSem}/semesterGlobalData/noticeList`,
      obj
    );
  } else {
    obj.scope = type;
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${type}`,
      obj
    );
    console.log("nothing added");
  }
  await fadeOutEffect(addNoticePopup);
  resetAddNoticePopup();
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await hideSectionLoader();
  await loadDashboard();
  showDashboard();
});
function loadTypeSelectorSubjects() {
  for (const key in appState.subjectMetaData) {
    const element = appState.subjectMetaData[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${element.name} notice`;
    addNoticeScopeInput.appendChild(option);
  }
}
async function resetAddNoticePopup() {
  addNoticeTitleInput.value = "";
  addNoticeDescriptionInput.value = "";
  addNoticefileInput.value = "";
  addNoticeLinkInput.value = "";
  addNoticeScopeInput.value = "";
  addNotivePopupFileAttachmentText.textContent = "Upload (Optional)";
  await fadeInEffect(addNoticeTypePlaceholder);
  await fadeInEffect(addNoticePopupFileAttachmentIcon);
  await fadeOutEffect(addNoticePopupLinkError);
  await fadeOutEffect(addNoticePopupdescriptionError);
  await fadeOutEffect(addNoticePopuptitleError);
}
async function renderSwiper() {
  const noticeEntries = getFlatNoticeOrdered();
  for (const key in noticeEntries) {
    const noticeData = noticeEntries[key];
    const swiperSlide = document.createElement("div");
    swiperSlide.className =
      "swiper-slide w-full max-w-[600px] bg-surface-2 !flex !flex-col gap-3 rounded-2xl p-4 lg:p-5";
    const topWrapper = document.createElement("div");
    topWrapper.className = "wrapper flex items-center gap-4  justify-between";

    const iconTitleWrapper = document.createElement("div");
    iconTitleWrapper.className =
      "slide-icon-title-wrapper w-full flex items-center gap-2 lg:gap-3";

    const icon = document.createElement("div");
    icon.className =
      "icon bg-surface flex h-[50px] w-[50px] items-center justify-center rounded-full shrink-0";

    const iconInner = document.createElement("i");
    iconInner.className = "ri-file-text-line text-2xl";
    icon.appendChild(iconInner);

    const title = document.createElement("p");
    title.className = "slider-title text-xl font-semibold";
    title.textContent = noticeData.title;

    iconTitleWrapper.appendChild(icon);
    iconTitleWrapper.appendChild(title);

    topWrapper.appendChild(iconTitleWrapper);

    const createdAt = noticeData.createdAt;
    const now = Date.now();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    if (diffInMinutes <= 1440) {
      const tag = document.createElement("p");
      tag.className = "bg-primary-400 px-2 py-1 w-fit rounded-xl text-xs";
      tag.textContent = "New";
      topWrapper.appendChild(tag);
    }
    const deleteIcon = document.createElement("div");
    deleteIcon.className =
      "delete-icon hidden editor-tool ml-auto flex items-center";
    const deleteIconInner = document.createElement("i");
    deleteIconInner.className =
      "fa-solid fa-trash text-xl cursor-pointer text-text-error";
    deleteIcon.appendChild(deleteIconInner);
    topWrapper.appendChild(deleteIcon);
    const wrapper2 = document.createElement("div");
    wrapper2.className = "wrapper";

    const description = document.createElement("div");
    description.className = "description text-text-secondary line-clamp-5";
    description.innerHTML = noticeData.description.replace(/\n/g, "<br>");

    const linkWrapper = document.createElement("div");
    linkWrapper.className =
      "wrapper text-text-link underline text-sm flex gap-4 pb-4 md:pb-0";

    const readmore = document.createElement("p");
    readmore.className = "cursor-pointer";
    readmore.textContent = "Readmore";
    readmore.style.display = "none";

    const attachment = document.createElement("a");
    attachment.textContent = "See attachment";
    attachment.className = "cursor-pointer hidden";
    attachment.target = "_blank";
    deleteIcon.addEventListener("click", async () => {
      console.log("this is gonna delete");

      deleteNotice(key, noticeData.attachmentId, noticeData.scope);
    });

    if (noticeData.attachmentURL) {
      let rawURL = noticeData.attachmentURL;
      if (!rawURL.startsWith("http")) {
        rawURL = "https://" + rawURL;
      }
      attachment.href = rawURL;
      attachment.classList.remove("hidden");
    }
    linkWrapper.appendChild(readmore);
    linkWrapper.appendChild(attachment);
    wrapper2.appendChild(description);
    wrapper2.appendChild(linkWrapper);
    swiperSlide.appendChild(topWrapper);
    swiperSlide.appendChild(wrapper2);
    noticeSwiper.appendSlide(swiperSlide);
    requestAnimationFrame(() => {
      if (description.scrollHeight > description.clientHeight) {
        readmore.style.display = "inline";
      }
    });

    readmore.addEventListener("click", () => {
      const popup = document.getElementById("readmore-popup");
      const popupTitle = document.getElementById("readmore-popup-title");
      const popupContent = document.getElementById("readmore-popup-content");
      const popupAttachment = document.getElementById("popup-attachment-link");
      popupAttachment;
      popupTitle.textContent = noticeData.title;
      popupContent.textContent = noticeData.description;
      if (noticeData.attachmentURL) {
        popupAttachment.href = noticeData.attachmentURL;
        popupAttachment.target = "_blank";
        popupAttachment.classList.remove("hidden");
      } else {
        popupAttachment.classList.add("hidden");
      }
      popup.classList.remove("hidden");
    });
  }
}
function getFlatNoticeOrdered() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const merged = {};

  // Helper: split into recent and old, and reverse each for latest-first
  const splitAndReverse = (data) => {
    const recent = [];
    const older = [];

    for (const [key, val] of Object.entries(data || {})) {
      if (val.createdAt && now - val.createdAt < oneDayMs) {
        recent.push([key, val]);
      } else {
        older.push([key, val]);
      }
    }

    return {
      recent: recent.reverse(), // latest first
      older: older.reverse(), // latest old first
    };
  };

  // Collect all major groups
  const global = splitAndReverse(appState.globalData?.noticeList);
  const semester = splitAndReverse(appState.semesterGlobalData?.noticeList);
  const division = splitAndReverse(
    appState.divisionData?.noticeData?.divisionNoticeList
  );

  // Flatten and split subject notices
  const subjectRaw = appState.divisionData?.noticeData?.subjectNoticeData || {};
  const subjectFlat = {};
  for (const subjectGroup of Object.values(subjectRaw)) {
    if (!subjectGroup) continue;
    for (const [key, val] of Object.entries(subjectGroup)) {
      subjectFlat[key] = val;
    }
  }
  const subject = splitAndReverse(subjectFlat);

  // Merge all in priority + recency order
  const addToMerged = (pairs) => {
    for (const [key, val] of pairs) {
      merged[key] = val;
    }
  };

  // Final merging: recent → old, global → semester → division → subject
  addToMerged(global.recent);
  addToMerged(semester.recent);
  addToMerged(division.recent);
  addToMerged(subject.recent);
  addToMerged(global.older);
  addToMerged(semester.older);
  addToMerged(division.older);
  addToMerged(subject.older);

  return merged;
}
async function deleteNotice(key, attachmentId, scope) {
  const confirmed = await showConfirmationPopup(
    "The notice will be deleted permenantly"
  );
  if (!confirmed) return;
  showSectionLoader("Deleting notice...");
  if (attachmentId && attachmentId !== "custom-link") {
    showSectionLoader("Deleting attachment...");
    const deleted = await deleteDriveFile(attachmentId);
    if (!deleted) {
      showErrorSection();
      return;
    }
    showSectionLoader("Deleting notice...");
  }
  if (scope === "department") {
    await deleteData(`globalData/noticeList/${key}`);
  } else if (scope === "semester") {
    await deleteData(
      `semesterList/${appState.activeSem}/semesterGlobalData/noticeList/${key}`
    );
  } else if (scope === "division") {
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/divisionNoticeList/${key}`
    );
  } else {
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${scope}/${key}`
    );
  }
  await deleteData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/subjects/notice/${appState.activeSubject}/${key}`
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await hideSectionLoader();
  await loadDashboard();
  showDashboard();
}
// upcoming sessions
const UpcomingSessionsSwiper = new Swiper(
  "#dashboard-upcoming-sessions-swiper",
  {
    direction: "horizontal",
    loop: true,
    // speed: 0,
    // effect: "fade",
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
      delay: 2000,
    },

    fadeEffect: {
      crossFade: true,
    },
  }
);
async function renderUpcomingSessions() {
  const upcomingSessions =
    appState?.globalData?.sessionData?.upcomingSessionList;

  if (!upcomingSessions || Object.keys(upcomingSessions).length === 0) {
    console.log("No upcoming sessions found from dashboard.");
    return;
  }

  for (const key in upcomingSessions) {
    const session = upcomingSessions[key];
    const { title, description, link, date, time, duration, hostUserId } =
      session;

    const mentorData = await get(ref(db, `userData/${hostUserId}`))
      .then((snapshot) => (snapshot.exists() ? snapshot.val() : null))
      .catch((error) => {
        console.error("Error fetching mentor data:", error);
        showErrorSection();
        return null;
      });

    if (!mentorData) continue;

    const name = `${mentorData.firstName} ${mentorData.lastName}`;
    const mentorClass = getFormattedClass(
      mentorData.semester,
      mentorData.division
    );
    const pfp = mentorData.pfpLink;

    // Create Swiper Slide container
    const swiperSlide = document.createElement("div");
    swiperSlide.className = "swiper-slide";

    // Create card inside swiper slide
    const card = document.createElement("div");
    card.className = "card flex flex-col gap-4 lg:gap-5 w-full rounded-3xl";

    card.innerHTML = `
      <div class="wrapper w-full flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3 icon-name-wrapper">
          <img
            src="${pfp}"
            class="h-11 w-11 object-cover rounded-full"
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

    swiperSlide.appendChild(card);
    UpcomingSessionsSwiper.appendSlide(swiperSlide);
  }
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

// time table - time table popup
// time table popup
export const timetablePopupSwiper = new Swiper("#time-table-popup-swiper", {
  direction: "horizontal",
  loop: true,
  slidesPerView: 1,
  spaceBetween: 30,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
export const timetablePopup = document.querySelector(
  ".time-table-popup-wrapper"
);
const timetablePopupCloseBtn = timetablePopup.querySelector(".close-popup-btn");
timetablePopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(timetablePopup);
  timetablePopupSwiper.slideTo(0, 0);
});
let seletectedDay = null;
let seletedEntry = null;
let isTimeTableEditing = false;
const addTimeTablePopup = document.querySelector(
  ".add-time-table-popup-wrapper"
);
const addTimeTablePopupTitle = addTimeTablePopup.querySelector(".popup-title");
// placeholders
const timeTableSubjectPlaceholder = addTimeTablePopup.querySelector(
  ".subject-placeholder"
);
const timeTableTypePlaceholder =
  addTimeTablePopup.querySelector(".type-placeholder");
const timeTableTimeFromPlaceholder = addTimeTablePopup.querySelector(
  ".time-from-placeholder"
);
const timeTableTimeToPlaceholder = addTimeTablePopup.querySelector(
  ".time-to-placeholder"
);
// inputs
const timeTableSubjectInput = addTimeTablePopup.querySelector(
  "#timetable-subject-selection-drop-down"
);
const timeTableTypeInput = addTimeTablePopup.querySelector(
  "#timetable-type-selection-drop-down"
);
const timeTableTimeFrom = addTimeTablePopup.querySelector(".time-from-input");
const timeTableTimeTo = addTimeTablePopup.querySelector(".time-to-input");
// errors
const TimeTableSubjectError = addTimeTablePopup.querySelector(
  ".subject-related-error"
);
const TimeTableTypeError = addTimeTablePopup.querySelector(
  ".type-related-error"
);
const TimeTableTimeFromError = addTimeTablePopup.querySelector(
  ".time-from-related-error"
);
const TimeTableTimeToError = addTimeTablePopup.querySelector(
  ".time-to-related-error"
);
// buttons
const timeTablePopupCloseBtn =
  addTimeTablePopup.querySelector(".close-popup-btn");
const timeTableAddBtn = addTimeTablePopup.querySelector(".add-btn");
const timeTableDeleteBtn = addTimeTablePopup.querySelector(".delete-icon");
timeTablePopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(addTimeTablePopup);
  resetTimeTablePopup();
});
timeTableAddBtn.addEventListener("click", async () => {
  const subject = timeTableSubjectInput.value;
  const type = timeTableTypeInput.value;
  const timeFrom = timeTableTimeFrom.value;
  const timeTo = timeTableTimeTo.value;
  let isError = false;
  if (!subject) {
    await fadeInEffect(TimeTableSubjectError);
    TimeTableSubjectError.textContent = "Required";
    fadeInEffect(TimeTableSubjectError);
    isError = true;
  }
  if (!type) {
    await fadeInEffect(TimeTableTypeError);
    TimeTableTypeError.textContent = "Required";
    fadeInEffect(TimeTableTypeError);
    isError = true;
  }
  if (!timeFrom) {
    await fadeInEffect(TimeTableTimeFromError);
    TimeTableTimeFromError.textContent = "Required";
    fadeInEffect(TimeTableTimeFromError);
    isError = true;
  }
  if (!timeTo) {
    await fadeInEffect(TimeTableTimeToError);
    TimeTableTimeToError.textContent = "Required";
    fadeInEffect(TimeTableTimeToError);
    isError = true;
  }
  if (isError) return;
  const newSlot = {
    subject: subject,
    type: type,
    fromTime: timeFrom,
    toTime: timeTo,
  };
  if (isTimeTableEditing) {
    showSectionLoader("Updating slot...");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${seletectedDay}/slotList/${seletedEntry}`,
      newSlot
    );
  } else {
    showSectionLoader("Adding slot...");

    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${seletectedDay}/slotList`,
      newSlot
    );
  }
  showSectionLoader("syncing data...");
  await fadeOutEffect(addTimeTablePopup);
  await fadeOutEffect(timetablePopup);
  await syncDbData();
  hideSectionLoader();
  await loadDashboard();
  showDashboard();
});
timeTableTimeFrom.addEventListener("click", () => {
  timeTableTimeFrom.showPicker();
});
timeTableTimeTo.addEventListener("click", () => {
  timeTableTimeTo.showPicker();
});
timeTableSubjectInput.addEventListener("change", () => {
  fadeOutEffect(timeTableSubjectPlaceholder);
});
timeTableTypeInput.addEventListener("change", () => {
  fadeOutEffect(timeTableTypePlaceholder);
});
timeTableTimeFrom.addEventListener("change", () => {
  fadeOutEffect(timeTableTimeFromPlaceholder);
});
timeTableTimeTo.addEventListener("change", () => {
  fadeOutEffect(timeTableTimeToPlaceholder);
});
timeTableSubjectInput.addEventListener("click", () => {
  fadeOutEffect(timeTableSubjectPlaceholder);
});
timeTableTypeInput.addEventListener("click", () => {
  fadeOutEffect(timeTableTypePlaceholder);
});
timeTableTimeFrom.addEventListener("click", () => {
  fadeOutEffect(timeTableTimeFromPlaceholder);
});
timeTableTimeTo.addEventListener("click", () => {
  fadeOutEffect(timeTableTimeToPlaceholder);
});
async function resetTimeTablePopup() {
  addTimeTablePopupTitle.textContent = "Add Slot";
  timeTableSubjectInput.value = "";
  timeTableTypeInput.value = "";
  timeTableTimeFrom.value = "";
  timeTableTimeTo.value = "";
  timeTableAddBtn.textContent = "Add Slot";
  isTimeTableEditing = false;
  await fadeInEffect(timeTableSubjectPlaceholder);
  await fadeInEffect(timeTableTypePlaceholder);
  await fadeInEffect(timeTableTimeFromPlaceholder);
  await fadeInEffect(timeTableTimeToPlaceholder);
  await fadeOutEffect(timeTableDeleteBtn);
  await fadeOutEffect(TimeTableTypeError);
  await fadeOutEffect(TimeTableSubjectError);
  await fadeOutEffect(TimeTableTimeFromError);
  await fadeOutEffect(TimeTableTimeToError);
}

function renderSubjects() {
  const subjectSelectionDropDown = document.querySelector(
    "#timetable-subject-selection-drop-down"
  );
  const subjectData = appState.subjectMetaData;
  for (const key in subjectData) {
    const subject = subjectData[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = subject.name;
    option.className = "text-text-primary";
    subjectSelectionDropDown.appendChild(option);
  }
  subjectSelectionDropDown.value = "";
}
async function editSlot(subjectName, type, timeFrom, timeTo, key) {
  await fadeInEffect(timeTableDeleteBtn);
  isTimeTableEditing = true;
  seletedEntry = key;
  addTimeTablePopupTitle.textContent = "Edit Slot";
  timeTableSubjectInput.value = subjectName;
  timeTableTypeInput.value = type;
  timeTableTimeFrom.value = timeFrom;
  timeTableTimeTo.value = timeTo;
  timeTableAddBtn.textContent = "Update Slot";
  hideElement(timeTableSubjectPlaceholder);
  hideElement(timeTableTypePlaceholder);
  hideElement(timeTableTimeFromPlaceholder);
  hideElement(timeTableTimeToPlaceholder);
  fadeInEffect(addTimeTablePopup);
}
timeTableDeleteBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this slot?"
  );
  if (!isConfirmed) return;
  showSectionLoader("Deleting slot...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/timetableDayList/${seletectedDay}/slotList/${seletedEntry}`
  );
  await fadeOutEffect(addTimeTablePopup);
  showSectionLoader("Syncing data...");
  await fadeOutEffect(addTimeTablePopup);
  resetTimeTablePopup();
  await syncDbData();
  hideSectionLoader();
  await loadDashboard();
  await showDashboard();
});

async function renderTimeTableSlides(swiperInstance) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const todayIndex = today.getDay();
  const dayOrder = Array.from({ length: 7 }, (_, i) => {
    return daysOfWeek[(todayIndex + i) % 7];
  });
  const timetableData = appState.divisionData.timetableDayList;
  console.log("Timetable Data:", timetableData);
  const sortedTimetable = {};
  dayOrder.forEach((day) => {
    sortedTimetable[day] = timetableData[day.toLowerCase()];
  });
  console.log("Sorted Timetable:", sortedTimetable);
  for (const key in sortedTimetable) {
    const day = sortedTimetable[key];
    const daySlide = document.createElement("div");
    daySlide.className = "swiper-slide !flex !flex-col gap-3 ";
    const dayDiv = document.createElement("div");
    dayDiv.className =
      "day font-semibold text-center text-xl w-full translate flex gap-2 justify-center items-center leading-tight -translatey-1";
    dayDiv.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    const plusIcon = document.createElement("div");
    plusIcon.className = "plus-icon hidden editor-tool";
    const plusIconInner = document.createElement("i");
    plusIconInner.className = "fa-solid fa-plus text-xl cursor-pointer";
    plusIcon.appendChild(plusIconInner);
    dayDiv.appendChild(plusIcon);
    daySlide.appendChild(dayDiv);
    plusIcon.addEventListener("click", () => {
      seletectedDay = key;
      seletedEntry = null;
      fadeInEffect(addTimeTablePopup);
    });
    if (!day.slotList) {
      const wrapper = document.createElement("div");
      wrapper.className =
        "wrapper w-fit h-fit flex flex-col gap-2 mx-auto my-auto items-center";
      const img = document.createElement("img");
      img.src =
        "https://ik.imagekit.io/yn9gz2n2g/others/holiday.png?updatedAt=1753439319775";
      img.alt = "";
      img.className = "h-20 w-20";
      const p = document.createElement("p");
      p.className = "font-semibold text-center";
      p.textContent = "Holiday";
      wrapper.appendChild(img);
      wrapper.appendChild(p);
      daySlide.appendChild(wrapper);
      swiperInstance.appendSlide(daySlide);

      continue;
    }
    const cardDiv = document.createElement("div");
    cardDiv.className =
      "card flex flex-col gap-4 border border-neutral-500 rounded-xl p-4 overflow-y-auto scrollbar-hide h-full";
    for (const key2 in day.slotList) {
      const singleEntry = day.slotList[key2];
      console.log("this is singleEntry:", singleEntry);
      const subjectName = singleEntry.subject;
      const icon = appState.subjectMetaData[subjectName].iconLink;
      const type = singleEntry.type;
      const timeFrom = new Date(`1970-01-01T${singleEntry.fromTime}:00`)
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s?[AP]M/i, "");

      const timeTo = new Date(`1970-01-01T${singleEntry.toTime}:00`)
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s?[AP]M/i, "");

      const time = `${timeFrom}-${timeTo}`;
      const wrapper = document.createElement("div");
      wrapper.className = "wrapper flex items-center justify-between w-full ";
      const nameIconWrapper = document.createElement("div");
      nameIconWrapper.className =
        "name-icon-wrapper flex items-center gap-2 w-20";
      const img = document.createElement("img");
      img.src = icon;
      img.alt = "";
      img.className = "h-[2.0rem] w-[2.0rem]";
      const subjectNameP = document.createElement("p");
      subjectNameP.className = "subject-name";
      subjectNameP.textContent = subjectName;
      nameIconWrapper.appendChild(img);
      nameIconWrapper.appendChild(subjectNameP);
      const typeMap = {
        Practical: "Prac",
        Lecture: "Lec",
        Tutorial: "Tut",
      };
      const typeP = document.createElement("p");
      typeP.className = "type w-10";
      typeP.textContent = typeMap[type] || type;
      const timeP = document.createElement("p");
      timeP.className = "time text-text-tertiary w-25";
      timeP.textContent = time;
      wrapper.appendChild(nameIconWrapper);
      wrapper.appendChild(typeP);
      wrapper.appendChild(timeP);
      cardDiv.appendChild(wrapper);
      daySlide.appendChild(dayDiv);
      wrapper.addEventListener("click", () => {
        if (!appState.isEditing) return;
        seletectedDay = key;
        seletedEntry = key2;
        console.log("clicked");

        editSlot(subjectName, type, timeFrom, timeTo, key2);
      });
    }
    daySlide.appendChild(cardDiv);
    swiperInstance.appendSlide(daySlide);
    swiperInstance.update(); // Update swiper
    swiperInstance.slideTo(0, 0);
  }
}
//rest data
// upcoming card elements
const upcomingTestCard = document.querySelector(
  ".dashboard-upcoming-test .card"
);
const upcomingTestCardTitle = upcomingTestCard.querySelector(".title");
const upcomingTestCardDescription =
  upcomingTestCard.querySelector(".description");
const upcomingTestCardDay = upcomingTestCard.querySelector(".day");
const upcomingTestCardDuration = upcomingTestCard.querySelector(".duration");
const upcomingTestCardLink = upcomingTestCard.querySelector(".link");
const upcomingTestJoinBtn = upcomingTestCard.querySelector(".join-btn");
const upcomingTestTitle = document.querySelector(".upcoming-test .main-title");
const comingSoonLabel = upcomingTestCard.querySelector(".coming-soon-label");
//no test elements
const noTest = upcomingTestCard.querySelector(".no-test");

//account popup
export const accountPopupWrapper = document.querySelector(
  ".account-popup-wrapper"
);
export const accountPopup = document.querySelector(".account-popup");
const accountPopupUserName = accountPopup.querySelector(".user-name");
const editPfpBtn = accountPopup.querySelector(".edit-pfp-btn");
const points = accountPopup.querySelector(".points");
const goldMedal = accountPopup.querySelector(".gold-medal .qty");
const silverMedal = accountPopup.querySelector(".silver-medal .qty");
const bronzeMedal = accountPopup.querySelector(".bronze-medal .qty");
const accountPopupCloseBtn = accountPopup.querySelector(".close-popup-btn");
const lgUserPfp = document.querySelector(".navigation-pfp");
const accountPopupProfile = accountPopup.querySelector(".account-popup-pfp");
const accountLogoutBtn = accountPopup.querySelector(".account-logout");
const accountDetailsBtn = accountPopup.querySelector(".account-details-btn");

editPfpBtn.addEventListener("click", async () => {
  await fadeOutEffect(accountPopup);
  await fadeInEffect(pfpSelectionPopup);
});
accountLogoutBtn.addEventListener("click", async () => {
  showSectionLoader("Logging out...");
  await signOutUser().then(async () => {
    await fadeOutEffect(document.body);
    setTimeout(() => {
      location.reload();
    }, 500);
  });
});
accountPopupProfile.addEventListener("click", async () => {
  await fadeOutEffect(accountPopup);
  await fadeInEffect(pfpSelectionPopup);
});
lgUserPfp.addEventListener("click", () => {
  fadeInEffect(accountPopupWrapper);
});
accountPopupCloseBtn.addEventListener("click", async () => {
  fadeOutEffect(accountPopupWrapper);
});
headerIcon.addEventListener("click", () => {
  console.log("header icon clicked");
  if (dashboardSection.classList.contains("hidden")) return;
  fadeInEffect(accountPopupWrapper);
});

const accountDetailsPopup = document.querySelector(".account-details-popup");
const accountDetailsCloseBtn =
  accountDetailsPopup.querySelector(".close-popup-btn");
const accountDetailsFirstName =
  accountDetailsPopup.querySelector(".first-name");
const accountDetailsLastName = accountDetailsPopup.querySelector(".last-name");
const accountDetailsEmail = accountDetailsPopup.querySelector(".email");
const accountDetailsSemester = accountDetailsPopup.querySelector(".semester");
const accountDetailsDivision = accountDetailsPopup.querySelector(".division");
const accountDetailsRollno = accountDetailsPopup.querySelector(".roll-no");
const accountDetailsDisplayName =
  accountDetailsPopup.querySelector(".user-name");
const accountDetailsPfp = accountDetailsPopup.querySelector(
  ".account-details-popup-pfp"
);
const accountDetailsEditPfpBtn =
  accountDetailsPopup.querySelector(".edit-pfp-btn");
const accountDetailsPoints = accountDetailsPopup.querySelector(".points");
const accountDetailsGoldMedal =
  accountDetailsPopup.querySelector(".gold-medal .qty");
const accountDetailsSilverMedal =
  accountDetailsPopup.querySelector(".silver-medal .qty");
const accountDetailsBronzeMedal =
  accountDetailsPopup.querySelector(".bronze-medal .qty");
accountPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(accountPopupWrapper);
});
accountDetailsBtn.addEventListener("click", async () => {
  await fadeOutEffect(accountPopup);
  await fadeInEffect(accountDetailsPopup);
});
accountDetailsCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(accountDetailsPopup);
  await fadeInEffect(accountPopup);
});
accountDetailsPfp.addEventListener("click", async () => {
  await fadeOutEffect(accountDetailsPopup);
  await fadeInEffect(pfpSelectionPopup);
});
accountDetailsEditPfpBtn.addEventListener("click", async () => {
  await fadeOutEffect(accountDetailsPopup);
  await fadeInEffect(pfpSelectionPopup);
});
function initUpcomingTestCard() {
  const testData = appState.divisionData.testData.upcomingTest;
  upcomingTestCardDay.textContent = `Day : ${testData.day}`;
  upcomingTestCardDuration.textContent = `Duration : ${testData.duration}`;
  upcomingTestCardTitle.textContent = testData.title;
  upcomingTestCardDescription.textContent = testData.description;
  if (testData.link) {
    upcomingTestJoinBtn.href = testData.link;
    fadeOutEffect(comingSoonLabel);
    fadeInEffect(upcomingTestJoinBtn);
  } else {
    fadeOutEffect(upcomingTestJoinBtn);
    fadeInEffect(comingSoonLabel);
  }
}
export async function loadDashboard() {
  await unloadDashboard();
  await renderSwiper();
  await renderUpcomingSubmissions();
  await renderTimeTableSlides(timetableSwiper);
  await renderTimeTableSlides(timetablePopupSwiper);
  await renderUpcomingSessions();
  initUserInfo();
  UpcomingSessionsSwiper.update();
  await initUpcomingTestCard();
  await loadTypeSelectorSubjects();
  renderSubjects();
}
export async function showDashboard() {
  headerTitle.textContent = `Hello ${appState.userData.firstName}`;
  await hideSections();
  await applyEditModeUI();
  headerIcon.src = appState.userData.pfpLink;
  if (window.innerWidth > 1024) hideElement(headerIcon);
  else showElement(headerIcon);

  await fadeInEffect(dashboardSection);
  UpcomingSessionsSwiper.update();
  UpcomingSessionsSwiper.autoplay.start();
  timetablePopupSwiper.update();
  timetableSwiper.update();
}
export async function unloadDashboard() {
  const subjectSelectionDropDown = document.querySelector(
    "#timetable-subject-selection-drop-down"
  );
  noticeSwiper.removeAllSlides();
  await fadeOutEffect(dashboardSection);
  subjectSelectionDropDown.innerHTML = "";
  upcomingSubmissionCardContainer.innerHTML = "";
  timetableSwiper.removeAllSlides();
  timetablePopupSwiper.removeAllSlides();
  noticeSwiper.removeAllSlides();
}
window.addEventListener("resize", () => {
  if (
    window.innerWidth > 1024 &&
    !dashboardSection.classList.contains("hidden")
  ) {
    hideElement(headerIcon);
  } else {
    showElement(headerIcon);
  }
});
function initUserInfo() {
  const gold = Number(appState.userData.medalList.gold || 0);
  const silver = Number(appState.userData.medalList.silver || 0);
  const bronze = Number(appState.userData.medalList.bronze || 0);
  const totalPoints = gold * 30 + silver * 20 + bronze * 10;
  accountPopupProfile.src = appState.userData.pfpLink;
  accountPopupUserName.textContent = `${appState.userData.firstName} ${appState.userData.lastName}`;
  editPfpBtn.src = appState.userData.pfpLink;
  goldMedal.textContent = gold;
  silverMedal.textContent = silver;
  bronzeMedal.textContent = bronze;
  points.textContent = totalPoints;
  accountDetailsPfp.src = appState.userData.pfpLink;
  accountDetailsDisplayName.textContent = `${appState.userData.firstName} ${appState.userData.lastName}`;
  accountDetailsRollno.textContent = `Roll No : ${appState.userData.rollNo}`;
  accountDetailsFirstName.textContent = `First name : ${appState.userData.firstName}`;
  accountDetailsLastName.textContent = `Last name : ${appState.userData.lastName}`;
  accountDetailsEmail.textContent = `Email : ${appState.userData.email}`;
  accountDetailsSemester.textContent = `Semester : ${appState.userData.semester}`;
  accountDetailsDivision.textContent = `Division : ${appState.userData.division}`;
  accountDetailsGoldMedal.textContent = gold;
  accountDetailsSilverMedal.textContent = silver;
  accountDetailsBronzeMedal.textContent = bronze;
  accountDetailsPoints.textContent = totalPoints;
  accountDetailsEditPfpBtn.src = appState.userData.pfpLink;
}
