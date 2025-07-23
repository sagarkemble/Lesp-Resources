import { deleteData, pushData, updateData } from "./firebase.js";
import {
  showSectionLoader,
  hideSectionLoader,
  showConfirmationPopup,
} from "./index.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { appState, syncDbData } from "./appstate.js";
import { uploadDriveFile } from "./driveApi.js";
const testsSection = document.querySelector(".tests-section");
export async function loadTestSection() {
  await unloadTestsSection();
  await renderUpcomingTests();
  await renderPreviousTestCard();
}
export async function showTestsSection() {
  headerIcon.src =
    "https://ik.imagekit.io/yn9gz2n2g/others/test.png?updatedAt=1751607386764";
  headerTitle.textContent = "Tests";
  await hideSections();
  fadeInEffect(testsSection);
}
async function unloadTestsSection() {
  await fadeOutEffect(testsSection);
  previousTestCardWrapper.innerHTML = "";
}

// upcoming card elements
const upcomingTestCard = document.querySelector(".upcoming-test .card");
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
const noTest = document.querySelector(".upcoming-test .no-test");
const scheduleTestButton = noTest.querySelector(".schedule-test-btn");
scheduleTestButton.addEventListener("click", async () => {
  await resetUpcomingTestPopup();
  upcomingTestDescriptionInput.value =
    appState.divisionData.testData.upcomingTest.description;
  fadeInEffect(upcomingTestPopup);
});
function renderUpcomingTests() {
  console.log(appState.divisionData.testData);
  if (appState.divisionData.testData.upcomingTest.visible == false) {
    console.log("no upcoming test");
    fadeOutEffect(upcomingTestCard);
    fadeInEffect(noTest);
    return;
  } else {
    fadeInEffect(upcomingTestCard);
    fadeOutEffect(noTest);
    const data = appState.divisionData.testData.upcomingTest;
    upcomingTestCardTitle.textContent = data.title;
    upcomingTestCardDescription.textContent = data.description;
    upcomingTestCardDay.textContent = `Day : ${data.day}`;
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
}
const upcomingTest = document.querySelector(".upcoming-test ");
const upcomingTestPopup = document.querySelector(
  ".edit-upcoming-test-popup-wrapper"
);
const upcomingTestPopupTitle = upcomingTestPopup.querySelector(".popup-title");
let toBeUnhide = null;
// buttons inside popup
const upcomingTestPopupCloseBtn =
  upcomingTestPopup.querySelector(".close-popup-btn");
const upcomingTestPopupCreateBtn =
  upcomingTestPopup.querySelector(".create-btn");
// inputs
const upcomingTestTitleInput = upcomingTestPopup.querySelector(".title-input");
const upcomingTestDescriptionInput =
  upcomingTestPopup.querySelector(".description-input");
const upcomingTestLinkInput = upcomingTestPopup.querySelector(".link-input");
const upcomingTestDayInput = upcomingTestPopup.querySelector(".day-input");
const upcomingTestDurationInput =
  upcomingTestPopup.querySelector(".duration-input");
// error messages
const upcomingTestTitleError = upcomingTestPopup.querySelector(
  ".title-related-error"
);
const upcomingTestDescriptionError = upcomingTestPopup.querySelector(
  ".description-related-error"
);
const upcomingTestLinkError = upcomingTestPopup.querySelector(
  ".link-related-error"
);
const upcomingTestDayError =
  upcomingTestPopup.querySelector(".day-related-error");
const upcomingTestDurationError = upcomingTestPopup.querySelector(
  ".duration-related-error"
);
const hideUpcomingTestBtn = upcomingTestPopup.querySelector(".hide-icon");
upcomingTestPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(upcomingTestPopup);
  resetUpcomingTestPopup();
});
upcomingTestPopupCreateBtn.addEventListener("click", async () => {
  let isError = false;
  const title = upcomingTestTitleInput.value.trim();
  const description = upcomingTestDescriptionInput.value.trim();
  const day = upcomingTestDayInput.value.trim();
  const duration = upcomingTestDurationInput.value.trim();
  const link = upcomingTestLinkInput.value.trim();
  if (!title) {
    upcomingTestTitleError.textContent = "Title is required";
    fadeInEffect(upcomingTestTitleError);
    isError = true;
  }
  if (!description) {
    upcomingTestDescriptionError.textContent = "Description is required";
    fadeInEffect(upcomingTestDescriptionError);
    isError = true;
  }
  if (!day) {
    upcomingTestDayError.textContent = "Day is required";
    fadeInEffect(upcomingTestDayError);
    isError = true;
  }
  if (!duration) {
    upcomingTestDurationError.textContent = "Duration is required";
    fadeInEffect(upcomingTestDurationError);
    isError = true;
  }
  if (link) {
    if (!/^https?:\/\//.test(link)) {
      upcomingTestLinkError.textContent =
        "Enter a valid link starting with http:// or https://";
      fadeInEffect(upcomingTestLinkError);
      isError = true;
    }
  }
  if (isError) return;
  showSectionLoader("Updating data...");
  await updateData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/testData/upcomingTest`,
    {
      title: upcomingTestTitleInput.value.trim(),
      description: upcomingTestDescriptionInput.value.trim(),
      day: upcomingTestDayInput.value.trim(),
      duration: upcomingTestDurationInput.value.trim(),
      link: upcomingTestLinkInput.value.trim(),
      visible: true,
    }
  );
  fadeOutEffect(upcomingTestPopup);
  showSectionLoader("Syncing data...");
  resetPreviousTestPopup();
  await syncDbData();
  hideSectionLoader();
  await loadTestSection();
  showTestsSection();
});
upcomingTestCard.addEventListener("click", () => {
  if (!appState.isEditing) return;
  if (appState.divisionData.testData.upcomingTest.visible === true) {
    fadeInEffect(hideUpcomingTestBtn);
  }
  upcomingTestTitleInput.value =
    appState.divisionData.testData.upcomingTest.title;
  upcomingTestDescriptionInput.value =
    appState.divisionData.testData.upcomingTest.description;
  upcomingTestDayInput.value = appState.divisionData.testData.upcomingTest.day;
  upcomingTestDurationInput.value =
    appState.divisionData.testData.upcomingTest.duration;
  upcomingTestLinkInput.value =
    appState.divisionData.testData.upcomingTest.link;

  fadeInEffect(upcomingTestPopup);
});
hideUpcomingTestBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to hide this test?"
  );
  if (!isConfirmed) return;
  showSectionLoader("Hiding test...");
  await updateData(
    `semesters/${appState.activeSem}/divisions/${appState.activeDiv}/testData/upcomingTest`,
    {
      visible: false,
    }
  );
  fadeOutEffect(upcomingTestPopup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  resetUpcomingTestPopup();
  await loadTestSection();
  showTestsSection();
});
function resetUpcomingTestPopup() {
  upcomingTestTitleInput.value = "";
  upcomingTestDescriptionInput.value = "";
  upcomingTestLinkInput.value = "";
  upcomingTestDayInput.value = "";
  upcomingTestDurationInput.value = "";
  upcomingTestPopupTitle.textContent = "Edit";
  fadeOutEffect(upcomingTestTitleError);
  fadeOutEffect(upcomingTestDescriptionError);
  fadeOutEffect(upcomingTestLinkError);
  fadeOutEffect(upcomingTestDayError);
  fadeOutEffect(upcomingTestDurationError);
}
//previous tests
let isPreviousTestEditing = false;
let previousTestEditingKey = null;
const previousTest = document.querySelector(".previous-tests");
const previousTestPopup = document.querySelector(
  ".previous-test-popup-wrapper"
);
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
        "File size must be less than 20 mb";
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
  const answerFile = answerFileInput.files[0];
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
    if (!answerFile) {
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
      answerFile,
      `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/testData`
    );
    if (!uploaded) {
      hideSectionLoader();
      return;
    }
    answerAttachmentUrl = uploaded.webViewLink;
    answerAttachmentId = uploaded.fileId;
    showSectionLoader("Uploading result...");
    let resultUploaded = await uploadDriveFile(
      resultFile,
      `resources/${appState.activeSem}/${appState.activeDiv}/${appState.activeSubject}/testData`
    );
    if (!resultUploaded) {
      hideSectionLoader();
      return;
    }
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
  showSectionLoader("Syncing data...");
  await fadeOutEffect(previousTestPopup);
  await syncDbData();
  hideSectionLoader();
  resetPreviousTestPopup();
  await loadTestSection();
  showTestsSection();
});
function renderPreviousTestCard() {
  if (!appState.divisionData.testData.previousTests) {
    fadeOutEffect(previousTest);
    return;
  }
  const previousTestsdata = appState.divisionData.testData.previousTests;
  for (const key in previousTestsdata) {
    const data = previousTestsdata[key];
    const title = data.title;
    const resultUrl = data.resultFileUrl;
    const answerUrl = data.answerFileUrl;
    const date = data.date;
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
  previousTestPopupCreateBtn.textContent = "Update";
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
  previousTestPopupCreateBtn.textContent = "Create";
  resultFileAttachmentText.textContent = "Upload Result Pdf";
  answerFileAttachmentText.textContent = "Upload Answer Pdf";
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
