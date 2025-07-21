import {
  db,
  push,
  remove,
  update,
  ref,
  app,
  deleteData,
  pushData,
  updateData,
} from "./firebase.js";
import { showSectionLoader, hideSectionLoader } from "./index.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { appState, syncDbData } from "./appstate.js";
import { uploadDriveFile } from "./driveApi.js";
const testsSection = document.querySelector(".tests-section");
export async function loadTestSection() {
  await unloadTestsSection();
  renderUpcomingTests();
  renderPreviousTestCard();
}
export async function showTestsSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/test.png?updatedAt=1751607386764";
  headerTitle.textContent = "Tests";
  await hideSections(true, true, true);
  fadeInEffect(testsSection);
}
async function unloadTestsSection() {
  await fadeOutEffect(testsSection);
  previousTestCardWrapper.innerHTML = "";
}
const upcomingTestCard = document.querySelector(".upcoming-test .card");
const upcomingTestCardTitle = upcomingTestCard.querySelector(".title");
const upcomingTestCardDescription =
  upcomingTestCard.querySelector(".description");
const upcomingTestCardDate = upcomingTestCard.querySelector(".day");
const upcomingTestCardDuration = upcomingTestCard.querySelector(".duration");
const upcomingTestCardLink = upcomingTestCard.querySelector(".link");
const upcomingTestJoinBtn = upcomingTestCard.querySelector(".join-btn");
const upcomingTestTitle = document.querySelector(".upcoming-test .main-title");
const comingSoonLabel = upcomingTestCard.querySelector(".coming-soon-label");
// const headerIcon = document.querySelector(".nav-icon");
// const headerTitle = document.querySelector(".nav-title");
function renderUpcomingTests() {
  console.log(appState);

  const data = appState.divisionData.testData.upcomingTest;
  upcomingTestCardTitle.textContent = data.title;
  upcomingTestCardDescription.textContent = data.description;
  upcomingTestCardDate.textContent = `Day : ${data.day}`;
  upcomingTestCardDuration.textContent = `Duration : ${data.duration}`;
  if (data.link) {
    upcomingTestJoinBtn.href = data.link;
    upcomingTestTitle.textContent = "Current Test";
    fadeOutEffect(comingSoonLabel);
    fadeInEffect(upcomingTestJoinBtn);
  } else {
    upcomingTestTitle.textContent = "Upcoming Test";
    fadeOutEffect(upcomingTestJoinBtn);
    fadeInEffect(comingSoonLabel);
  }
}
//upcmoing test
const addUpcomingTestPopup = document.querySelector(
  ".edit-upcoming-test-popup-wrapper"
);
// buttons inside popup
const addUpcomingTestPopupCloseBtn =
  addUpcomingTestPopup.querySelector(".close-popup-btn");
const addUpcomingTestPopupCreateBtn =
  addUpcomingTestPopup.querySelector(".create-btn");
// inputs
const addUpcomingTestTitleInput =
  addUpcomingTestPopup.querySelector(".title-input");
const addUpcomingTestDescriptionInput =
  addUpcomingTestPopup.querySelector(".description-input");
const addUpcomingTestLinkInput =
  addUpcomingTestPopup.querySelector(".link-input");
const addUpcomingTestDayInput =
  addUpcomingTestPopup.querySelector(".day-input");
const addUpcomingTestDurationInput =
  addUpcomingTestPopup.querySelector(".duration-input");
// error messages
const addUpcomingTestTitleError = addUpcomingTestPopup.querySelector(
  ".title-related-error"
);
const addUpcomingTestDescriptionError = addUpcomingTestPopup.querySelector(
  ".description-related-error"
);
const addUpcomingTestLinkError = addUpcomingTestPopup.querySelector(
  ".link-related-error"
);
const addUpcomingTestDayError =
  addUpcomingTestPopup.querySelector(".day-related-error");
const addUpcomingTestDurationError = addUpcomingTestPopup.querySelector(
  ".duration-related-error"
);

addUpcomingTestPopupCloseBtn.addEventListener("click", () => {
  fadeOutEffect(addUpcomingTestPopup);
});
addUpcomingTestPopupCreateBtn.addEventListener("click", async () => {
  let isError = false;
  const title = addUpcomingTestTitleInput.value.trim();
  const description = addUpcomingTestDescriptionInput.value.trim();
  const day = addUpcomingTestDayInput.value.trim();
  const duration = addUpcomingTestDurationInput.value.trim();
  const link = addUpcomingTestLinkInput.value.trim();
  if (!title) {
    addUpcomingTestTitleError.textContent = "Title is required";
    fadeInEffect(addUpcomingTestTitleError);
    isError = true;
  }
  if (!description) {
    addUpcomingTestDescriptionError.textContent = "Description is required";
    fadeInEffect(addUpcomingTestDescriptionError);
    isError = true;
  }
  if (!day) {
    addUpcomingTestDayError.textContent = "Day is required";
    fadeInEffect(addUpcomingTestDayError);
    isError = true;
  }
  if (!duration) {
    addUpcomingTestDurationError.textContent = "Duration is required";
    fadeInEffect(addUpcomingTestDurationError);
    isError = true;
  }
  if (link) {
    if (!/^https?:\/\//.test(link)) {
      addUpcomingTestLinkError.textContent =
        "Enter a valid link starting with http:// or https://";
      fadeInEffect(addUpcomingTestLinkError);
      isError = true;
    }
  }
  if (isError) return;
  showSectionLoader("Updating data...");
  await updateData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/testData/upcomingTest`,
    {
      title: addUpcomingTestTitleInput.value.trim(),
      description: addUpcomingTestDescriptionInput.value.trim(),
      day: addUpcomingTestDayInput.value.trim(),
      duration: addUpcomingTestDurationInput.value.trim(),
      link: addUpcomingTestLinkInput.value.trim(),
    }
  );
  fadeOutEffect(addUpcomingTestPopup);
  resetPreviousTestPopup();
  await syncDbData();
  hideSectionLoader();
  loadTestSection();
});
upcomingTestCard.addEventListener("click", () => {
  if (!appState.isEditing) return;
  addUpcomingTestTitleInput.value =
    appState.divisionData.testData.upcomingTest.title;
  addUpcomingTestDescriptionInput.value =
    appState.divisionData.testData.upcomingTest.description;
  addUpcomingTestDayInput.value =
    appState.divisionData.testData.upcomingTest.day;
  addUpcomingTestDurationInput.value =
    appState.divisionData.testData.upcomingTest.duration;
  addUpcomingTestLinkInput.value =
    appState.divisionData.testData.upcomingTest.link;
  fadeInEffect(addUpcomingTestPopup);
});

//previous tests
const previousTestPopup = document.querySelector(
  ".previous-test-popup-wrapper"
);
let isPreviousTestEditing = false;
let previousTestEditingKey = null;
const previousTestFakePlaceholder =
  previousTestPopup.querySelector(".fake-placeholder");
const addPreviousTestBtn = document.querySelector(".previous-tests .add-btn");
const previousTestPopupTitle = previousTestPopup.querySelector(".popup-title");

// button inside popup
const previousTestPopupCreateBtn =
  previousTestPopup.querySelector(".create-btn");
const previousTestPopupCloseBtn =
  previousTestPopup.querySelector(".close-popup-btn");
const previousTestCardWrapper = document.querySelector(
  ".previous-tests .card-container"
);
// inputs
const previousTestTitleInput = previousTestPopup.querySelector(
  "#previous-test-title-input"
);
const previousTestDateInput = previousTestPopup.querySelector(
  "#previous-test-date-input"
);
const previousTestDurationInput = previousTestPopup.querySelector(
  "#previous-test-duration-input"
);
const resultFileInput = previousTestPopup.querySelector("#result-file-input");
const answerFileInput = previousTestPopup.querySelector("#answer-file-input");

// error messages
const previousTestTitleError = previousTestPopup.querySelector(
  ".title-related-error"
);
const previousTestDateError = previousTestPopup.querySelector(
  ".date-related-error"
);
const previousTestDurationError = previousTestPopup.querySelector(
  ".duration-related-error"
);
const resultFileAttachmentError = previousTestPopup.querySelector(
  " .result-file-related-error"
);
const answerFileAttachmentError = previousTestPopup.querySelector(
  ".answer-file-related-error"
);

// result upload ui
const resultFileAttachment = previousTestPopup.querySelector(
  ".result-file-attachment"
);
const resultFileInputWrapper = previousTestPopup.querySelector(
  ".result-file-input-wrapper"
);
const resultFileAttachmentIcon = resultFileAttachment.querySelector(
  ".upload-attachment-icon"
);
const resultFileAttachmentText =
  resultFileAttachment.querySelector(".upload-text");
const answerFileAttachment = previousTestPopup.querySelector(
  ".answer-file-attachment"
);
const answerFileInputWrapper = previousTestPopup.querySelector(
  ".answer-file-input-wrapper"
);
const answerFileAttachmentIcon = answerFileAttachment.querySelector(
  ".upload-attachment-icon"
);
const answerFileAttachmentText =
  answerFileAttachment.querySelector(".upload-text");
previousTestPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(previousTestPopup);
  resetPreviousTestPopup();
});
resultFileInput.addEventListener("change", () => {
  const file = resultFileInput.files[0];
  if (file) {
    if (file.size > 20000000) {
      resultFileAttachmentError.textContent =
        "File size must be less than 20mb";
      fadeInEffect(resultFileAttachmentError);
      return;
    }
    resultFileAttachmentIcon.classList.add("hidden");
    resultFileAttachmentText.textContent = "1 file uploaded";
  }
});
resultFileAttachment.addEventListener("click", () => {
  resultFileInput.click();
});
answerFileInput.addEventListener("change", () => {
  const file = answerFileInput.files[0];
  if (file) {
    if (file.size > 20000000) {
      answerFileAttachmentError.textContent =
        "File size must be less than 20mb";
      fadeInEffect(answerFileAttachmentError);
      return;
    }
    answerFileAttachmentIcon.classList.add("hidden");
    answerFileAttachmentText.textContent = "1 file uploaded";
  }
});
answerFileAttachment.addEventListener("click", () => {
  answerFileInput.click();
});
addPreviousTestBtn.addEventListener("click", () => {
  fadeInEffect(previousTestPopup);
});
previousTestDateInput.addEventListener("input", () => {
  previousTestFakePlaceholder.focus();
  fadeOutEffect(previousTestFakePlaceholder);
});
previousTestDateInput.addEventListener("click", () => {
  if (previousTestDateInput.showPicker) {
    previousTestDateInput.showPicker();
  } else {
    previousTestDateInput.focus();
  }
});
previousTestPopupCreateBtn.addEventListener("click", async () => {
  fadeOutEffect(previousTestDateError);
  fadeOutEffect(previousTestDurationError);
  fadeOutEffect(previousTestTitleError);
  fadeOutEffect(answerFileAttachmentError);
  fadeOutEffect(resultFileAttachmentError);
  const title = previousTestTitleInput.value.trim();
  const date = previousTestDateInput.value;
  const duration = previousTestDurationInput.value.trim();
  const anserFile = answerFileInput.files[0];
  const resultFile = resultFileInput.files[0];
  let isError = false;
  let answerAttachmentUrl;
  let answerAttachmentId;
  let resultAttachmentUrl;
  let resultAttachmentId;
  if (!title) {
    previousTestTitleError.textContent = "Title is required";
    fadeInEffect(previousTestTitleError);
    isError = true;
  }
  if (!date) {
    previousTestDateError.textContent = "Date is required";
    fadeInEffect(previousTestDateError);
    isError = true;
  }
  if (!duration) {
    previousTestDurationError.textContent = "Duration is required";
    fadeInEffect(previousTestDurationError);
    isError = true;
  }
  if (isPreviousTestEditing) {
    if (isError) return;
  }

  if (isPreviousTestEditing) {
    showSectionLoader("Updating data....");
    await updateData(
      `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/testData/previousTests/${previousTestEditingKey}`,
      {
        title: title,
        date: date,
        duration: duration,
      }
    );
  } else {
    if (!anserFile) {
      answerFileAttachmentError.textContent = "Answer file is required";
      fadeInEffect(answerFileAttachmentError);
      isError = true;
    }
    if (!resultFile) {
      resultFileAttachmentError.textContent = "Result file is required";
      fadeInEffect(resultFileAttachmentError);
      isError = true;
    }
    if (isError) return;
    showSectionLoader("Uploading answer key...");
    let uploaded = await uploadDriveFile(
      anserFile,
      `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/testData`
    );
    if (!uploaded) return;
    answerAttachmentUrl = uploaded.webViewLink;
    answerAttachmentId = uploaded.fileId;
    showSectionLoader("Uploading result...");
    let resultUploaded = await uploadDriveFile(
      resultFile,
      `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/testData`
    );
    if (!resultUploaded) return;
    resultAttachmentUrl = resultUploaded.webViewLink;
    resultAttachmentId = resultUploaded.fileId;
    showSectionLoader("Adding data....");
    await pushData(
      `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/testData/previousTests`,
      {
        title: title,
        date: date,
        duration: duration,
        answerFileId: answerAttachmentId,
        resultFileId: resultAttachmentId,
        answerFileUrl: answerAttachmentUrl,
        resultFileUrl: resultAttachmentUrl,
      }
    );
  }
  await syncDbData();
  await fadeOutEffect(previousTestPopup);
  hideSectionLoader();
  resetPreviousTestPopup();
  resetPreviousTestPopup();
  loadTestSection();
});
function renderPreviousTestCard() {
  const previousTestsdata = appState.divisionData.testData.previousTests;
  for (const key in previousTestsdata) {
    const data = previousTestsdata[key];
    const title = data.title;
    const resultUrl = data.resultFileUrl;
    const answerUrl = data.answerFileUrl;
    const date = data.date;
    // Create outer card
    const card = document.createElement("div");
    card.classList.add(
      "card",
      "bg-surface-2",
      "flex",
      "flex-col",
      "gap-4",
      "lg:gap-5",
      "w-full",
      "rounded-3xl",
      "lg:max-w-[500px]",
      "p-6"
    );

    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "wrapper",
      "w-full",
      "flex",
      "items-center",
      "justify-between"
    );
    const iconNameWrapper = document.createElement("div");
    iconNameWrapper.classList.add(
      "flex",
      "items-center",
      "gap-2",
      "lg:gap-3",
      "icon-name-wrapper"
    );
    const img = document.createElement("img");
    img.src =
      "https://ik.imagekit.io/yn9gz2n2g/others/test.png?updatedAt=1751607386764";
    img.classList.add("h-[45px]");
    img.alt = "";
    const testTitle = document.createElement("p");
    testTitle.classList.add("text-xl", "font-semibold");
    testTitle.textContent = title;
    iconNameWrapper.appendChild(img);
    iconNameWrapper.appendChild(testTitle);
    const resultLink = document.createElement("a");
    resultLink.href = resultUrl;
    resultLink.target = "_blank";
    const resultBtn = document.createElement("div");
    resultBtn.classList.add("button-hug");
    resultBtn.textContent = "Result";
    resultLink.appendChild(resultBtn);
    wrapper.appendChild(iconNameWrapper);
    wrapper.appendChild(resultLink);
    const dateWrapper = document.createElement("div");
    dateWrapper.classList.add(
      "duration-date-wrapper",
      "text-xs",
      "font-light",
      "flex",
      "flex-col",
      "gap-1"
    );
    const day = document.createElement("p");
    day.classList.add("date");
    const [year, month, dayPart] = date.split("-");
    day.textContent = `Date : ${dayPart}-${month}-${year.slice(2)}`;

    const answerLink = document.createElement("a");
    answerLink.href = answerUrl;
    answerLink.target = "_blank";
    answerLink.classList.add("text-text-link", "underline", "w-fit");
    answerLink.textContent = "View answer key";
    dateWrapper.appendChild(day);
    dateWrapper.appendChild(answerLink);
    card.appendChild(wrapper);
    card.appendChild(dateWrapper);
    previousTestCardWrapper.appendChild(card);
    card.addEventListener("click", () => {
      if (appState.isEditing) {
        editPreviousTestCard(key);
      }
    });
  }
}

function editPreviousTestCard(key) {
  const data = appState.divisionData.testData.previousTests[key];
  isPreviousTestEditing = true;
  previousTestEditingKey = key;
  previousTestTitleInput.value = data.title;
  previousTestDateInput.value = data.date;
  previousTestDurationInput.value = data.duration;
  previousTestPopupTitle.textContent = "Edit test";
  fadeOutEffect(previousTestFakePlaceholder);
  fadeOutEffect(answerFileInputWrapper);
  fadeOutEffect(resultFileInputWrapper);
  fadeInEffect(previousTestPopup);
}
function resetPreviousTestPopup() {
  fadeOutEffect(previousTestPopup);
  previousTestTitleInput.value = "";
  previousTestDateInput.value = "";
  previousTestDurationInput.value = "";
  previousTestPopupTitle.textContent = "Add test";
  fadeOutEffect(previousTestDateError);
  fadeOutEffect(previousTestDurationError);
  fadeOutEffect(previousTestTitleError);
  fadeOutEffect(answerFileAttachmentError);
  fadeOutEffect(resultFileAttachmentError);
  fadeInEffect(answerFileAttachmentIcon);
  fadeInEffect(resultFileAttachmentIcon);
  fadeInEffect(resultFileAttachmentText);
  fadeInEffect(answerFileAttachmentText);
  fadeInEffect(answerFileAttachment);
  fadeInEffect(resultFileAttachment);
  isPreviousTestEditing = false;
  previousTestEditingKey = null;
  fadeInEffect(previousTestFakePlaceholder);
  fadeInEffect(answerFileInputWrapper);
  fadeInEffect(resultFileInputWrapper);
}
