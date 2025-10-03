import { deleteData, pushData, updateData } from "./firebase.js";
import {
  showSectionLoader,
  hideSectionLoader,
  showConfirmationPopup,
  applyEditModeUI,
} from "./index.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { appState, syncDbData } from "./appstate.js";
import { deleteDriveFile, uploadDriveFile } from "./driveApi.js";
import { initUpcomingTestCard as dashboardInitUpcomingTestCard } from "./dashboard.js";
import { showErrorSection } from "./error.js";
const DOM = {
  testsSection: document.querySelector(".tests-section"),
  upcomingTest: {
    container: document.querySelector(".upcoming-test"),
    card: document.querySelector(".upcoming-test .card"),
    containerTitle: document.querySelector(".upcoming-test .container-title"),
    cardTitle: document.querySelector(".upcoming-test .card .title"),
    cardDescription: document.querySelector(".upcoming-test .description"),
    cardDay: document.querySelector(".upcoming-test .day"),
    cardDuration: document.querySelector(".upcoming-test .duration"),
    cardJoinBtn: document.querySelector(".upcoming-test .join-btn"),
    cardComingSoonLabel: document.querySelector(
      ".upcoming-test .coming-soon-label",
    ),
    noUpcomingTest: document.querySelector(".upcoming-test .no-test"),
    scheduleBtn: document.querySelector(".schedule-test-btn"),
  },
  upcomingTestPopup: {
    popup: document.querySelector(".edit-upcoming-test-popup-wrapper"),
    popupTitle: document.querySelector(
      ".edit-upcoming-test-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".edit-upcoming-test-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".edit-upcoming-test-popup-wrapper .success-btn",
    ),
    hideBtn: document.querySelector(
      ".edit-upcoming-test-popup-wrapper .hide-icon",
    ),

    inputs: {
      title: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .title-input",
      ),
      description: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .description-input",
      ),
      link: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .link-input",
      ),
      day: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .day-input",
      ),
      duration: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .duration-input",
      ),
    },
    errors: {
      title: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .title-related-error",
      ),
      description: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .description-related-error",
      ),
      link: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .link-related-error",
      ),
      day: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .day-related-error",
      ),
      duration: document.querySelector(
        ".edit-upcoming-test-popup-wrapper .duration-related-error",
      ),
    },
  },
  previousTest: {
    container: document.querySelector(".previous-tests"),
    noPreviousTest: document.querySelector(".no-previous-test"),
    addContentBtn: document.querySelector(".previous-tests .add-content-btn"),
    cardContainer: document.querySelector(".previous-tests .card-container"),
  },
  previousTestPopup: {
    popup: document.querySelector(".previous-test-popup-wrapper"),
    popupTitle: document.querySelector(
      ".previous-test-popup-wrapper .popup-title",
    ),
    successBtn: document.querySelector(
      ".previous-test-popup-wrapper .success-btn",
    ),
    closeBtn: document.querySelector(
      ".previous-test-popup-wrapper .close-popup-btn",
    ),
    deleteBtn: document.querySelector(
      ".previous-test-popup-wrapper .delete-btn",
    ),
    fakeDatePlaceholder: document.querySelector(
      ".previous-test-popup-wrapper .fake-placeholder",
    ),

    inputs: {
      title: document.querySelector("#previous-test-title-input"),
      date: document.querySelector("#previous-test-date-input"),
      duration: document.querySelector("#previous-test-duration-input"),
      answerFile: document.querySelector("#answer-file-input"),
      resultFile: document.querySelector("#result-file-input"),
    },
    errors: {
      title: document.querySelector(
        ".previous-test-popup-wrapper .title-related-error",
      ),
      date: document.querySelector(
        ".previous-test-popup-wrapper .date-related-error",
      ),
      duration: document.querySelector(
        ".previous-test-popup-wrapper .duration-related-error",
      ),
      answer: document.querySelector(
        ".previous-test-popup-wrapper .answer-file-related-error",
      ),
      result: document.querySelector(
        ".previous-test-popup-wrapper .result-file-related-error",
      ),
    },
    attachments: {
      answer: {
        icon: document.querySelector(
          ".answer-file-attachment-container .upload-icon",
        ),
        text: document.querySelector(
          ".answer-file-attachment-container .upload-text",
        ),
        inputWrapper: document.querySelector(".answer-file-input-wrapper"),
      },
      result: {
        icon: document.querySelector(
          ".result-file-attachment-container .upload-icon",
        ),
        text: document.querySelector(
          ".result-file-attachment-container .upload-text",
        ),
        inputWrapper: document.querySelector(".result-file-input-wrapper"),
      },
    },
  },
};
export async function loadTestSection() {
  try {
    await unloadTestsSection();
    initUpcomingTestCard();
    renderPreviousTestCard();
    applyEditModeUI();
  } catch (err) {
    showErrorSection("Error while loading test section", err);
  }
}
export async function showTestsSection() {
  headerIcon.classList.add("bg-primary");

  headerIcon.innerHTML = ` <svg
  width="1.9rem"
  height="2.47rem"
  viewBox="0 0 20 26"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <image
    width="20"
    height="26"
    x="0"
    y="0"
    xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdElEQVR4nO2TQQqAQAhFvVYdIjpJXbtbvDbtWiRqIyM+cDMoPviOSGMEOIHrqWP08p03W+QCLQuwapvDBcTYrxaQj7fo2TkEtNQT8NAClIgA5dGl/QL5W8BDDQGyIyBbwEMNAbIjIFvAQwtgjSCaeQQaGcgNJKA3wwCTxc8AAAAASUVORK5CYII="
  ></image>
</svg>`;
  headerTitle.textContent = "Tests";
  await hideSections();
  fadeInEffect(DOM.testsSection);
}
async function unloadTestsSection() {
  await fadeOutEffect(DOM.testsSection);
  DOM.previousTest.cardContainer.innerHTML = "";
}
// upcoming test  function and listener
DOM.upcomingTest.scheduleBtn.addEventListener("click", () => {
  resetUpcomingTestPopup();
  DOM.upcomingTestPopup.popupTitle.textContent = "Add test";
  hideElement(DOM.upcomingTestPopup.hideBtn);
  DOM.upcomingTestPopup.inputs.description.value =
    appState.divisionData.testData.upcomingTest.description;
  fadeInEffect(DOM.upcomingTestPopup.popup);
});
function initUpcomingTestCard() {
  const isData = appState.divisionData?.testData?.upcomingTest;
  if (!isData) return;
  if (appState.divisionData.testData.upcomingTest.isVisible == false) {
    hideElement(DOM.upcomingTest.card);
    showElement(DOM.upcomingTest.noUpcomingTest);
    return;
  } else {
    showElement(DOM.upcomingTest.card);
    hideElement(DOM.upcomingTest.noUpcomingTest);
    const data = appState.divisionData.testData.upcomingTest;
    DOM.upcomingTest.cardTitle.textContent =
      data.title.charAt(0).toUpperCase() + data.title.slice(1);
    DOM.upcomingTest.cardDescription.textContent =
      data.description.charAt(0).toUpperCase() + data.description.slice(1);
    DOM.upcomingTest.cardDay.textContent = `Day : ${data.day.charAt(0).toUpperCase() + data.day.slice(1)}`;
    DOM.upcomingTest.cardDuration.textContent = `Duration : ${data.duration} mins`;
    if (data.link) {
      DOM.upcomingTest.cardJoinBtn.href = data.link;
      DOM.upcomingTest.containerTitle.textContent = "Current Test";
      hideElement(DOM.upcomingTest.cardComingSoonLabel);
      showElement(DOM.upcomingTest.cardJoinBtn);
    } else {
      DOM.upcomingTest.containerTitle.textContent = "Upcoming Test";
      hideElement(DOM.upcomingTest.cardJoinBtn);
      showElement(DOM.upcomingTest.cardComingSoonLabel);
    }
  }
}

// upcoming test popup functions and listeners
DOM.upcomingTestPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.upcomingTestPopup.popup);
  resetUpcomingTestPopup();
});
DOM.upcomingTestPopup.successBtn.addEventListener("click", async () => {
  let isError = false;
  hideElement(DOM.upcomingTestPopup.errors.title);
  hideElement(DOM.upcomingTestPopup.errors.description);
  hideElement(DOM.upcomingTestPopup.errors.link);
  hideElement(DOM.upcomingTestPopup.errors.day);
  hideElement(DOM.upcomingTestPopup.errors.duration);
  const inputTitle = DOM.upcomingTestPopup.inputs.title.value.trim();
  const inputDescription =
    DOM.upcomingTestPopup.inputs.description.value.trim();
  const inputDay = DOM.upcomingTestPopup.inputs.day.value.trim();
  let inputDuration = DOM.upcomingTestPopup.inputs.duration.value.trim();
  const inputLink = DOM.upcomingTestPopup.inputs.link.value.trim();
  if (!inputTitle) {
    DOM.upcomingTestPopup.errors.title.textContent = "Title is required";
    showElement(DOM.upcomingTestPopup.errors.title);
    isError = true;
  }
  if (!inputDescription) {
    DOM.upcomingTestPopup.errors.description.textContent =
      "Description is required";
    showElement(DOM.upcomingTestPopup.errors.description);
    isError = true;
  }
  if (!inputDay) {
    DOM.upcomingTestPopup.errors.day.textContent = "Day is required";
    showElement(DOM.upcomingTestPopup.errors.day);
    isError = true;
  }
  if (!inputDuration) {
    DOM.upcomingTestPopup.errors.duration.textContent = "Duration is required";
    showElement(DOM.upcomingTestPopup.errors.duration);
    isError = true;
  }
  if (inputLink) {
    if (!/^https?:\/\//.test(inputLink)) {
      DOM.upcomingTestPopup.errors.link.textContent =
        "Enter a valid link starting with http:// or https://";
      showElement(DOM.upcomingTestPopup.errors.link);
      isError = true;
    }
  }
  if (isError) return;
  showSectionLoader("Updating data...");
  inputDuration = Number(inputDuration);
  await updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/upcomingTest`,
    {
      title: inputTitle,
      description: inputDescription,
      day: inputDay,
      duration: inputDuration,
      link: inputLink,
      isVisible: true,
    },
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.upcomingTestPopup.popup);
  resetUpcomingTestPopup();
  await syncDbData();
  await loadTestSection();
  dashboardInitUpcomingTestCard();
  await hideSectionLoader();
  showTestsSection();
});
DOM.upcomingTestPopup.inputs.duration.addEventListener("input", () => {
  if (DOM.upcomingTestPopup.inputs.duration.value.length == 3) {
    DOM.upcomingTestPopup.errors.duration.textContent =
      "Max time can be 99 min";
    DOM.upcomingTestPopup.inputs.duration.value =
      DOM.upcomingTestPopup.inputs.duration.value.slice(0, 2);
    showElement(DOM.upcomingTestPopup.errors.duration);
  } else {
    hideElement(DOM.upcomingTestPopup.errors.duration);
  }
});
DOM.upcomingTest.card.addEventListener("click", () => {
  if (!appState.isEditing) return;
  if (appState.divisionData.testData.upcomingTest.visible === true) {
    showElement(hideUpcomingTestBtn);
  }
  DOM.upcomingTestPopup.inputs.title.value =
    appState.divisionData.testData.upcomingTest.title;
  DOM.upcomingTestPopup.inputs.description.value =
    appState.divisionData.testData.upcomingTest.description;
  DOM.upcomingTestPopup.inputs.day.value =
    appState.divisionData.testData.upcomingTest.day;
  DOM.upcomingTestPopup.inputs.duration.value =
    appState.divisionData.testData.upcomingTest.duration;
  DOM.upcomingTestPopup.inputs.link.value =
    appState.divisionData.testData.upcomingTest.link;
  fadeInEffect(DOM.upcomingTestPopup.popup);
});
DOM.upcomingTestPopup.hideBtn.addEventListener("click", async () => {
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to hide this test?",
  );
  if (!isConfirmed) return;
  showSectionLoader("Hiding test...");
  await updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/upcomingTest`,
    {
      isVisible: false,
    },
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.upcomingTestPopup.popup);
  await syncDbData();
  resetUpcomingTestPopup();
  await loadTestSection();
  await dashboardInitUpcomingTestCard();
  await hideSectionLoader();
  showTestsSection();
});
DOM.upcomingTestPopup.inputs.title.addEventListener("input", () => {
  if (DOM.upcomingTestPopup.inputs.title.value.length == 13) {
    DOM.upcomingTestPopup.errors.title.textContent =
      "Max 12 characters reached";

    DOM.upcomingTestPopup.inputs.title.value =
      DOM.upcomingTestPopup.inputs.title.value.slice(0, 12);
    showElement(DOM.upcomingTestPopup.errors.title);
  } else {
    hideElement(DOM.upcomingTestPopup.errors.title);
  }
});
DOM.upcomingTestPopup.inputs.description.addEventListener("input", () => {
  if (DOM.upcomingTestPopup.inputs.description.value.length == 201) {
    DOM.upcomingTestPopup.errors.description.textContent =
      "Max 200 characters reached";
    DOM.upcomingTestPopup.inputs.description.value =
      DOM.upcomingTestPopup.inputs.description.value.slice(0, 200);
    showElement(DOM.upcomingTestPopup.errors.description);
  } else {
    hideElement(DOM.upcomingTestPopup.errors.description);
  }
});
function resetUpcomingTestPopup() {
  DOM.upcomingTestPopup.inputs.title.value = "";
  DOM.upcomingTestPopup.inputs.description.value = "";
  DOM.upcomingTestPopup.inputs.link.value = "";
  DOM.upcomingTestPopup.inputs.day.value = "";
  DOM.upcomingTestPopup.inputs.duration.value = "";
  DOM.upcomingTestPopup.popupTitle.textContent = "Edit";
  showElement(DOM.upcomingTestPopup.hideBtn);
  hideElement(DOM.upcomingTestPopup.errors.title);
  hideElement(DOM.upcomingTestPopup.errors.description);
  hideElement(DOM.upcomingTestPopup.errors.link);
  hideElement(DOM.upcomingTestPopup.errors.day);
  hideElement(DOM.upcomingTestPopup.errors.duration);
}

//previous tests popup function and listener
let isPreviousTestEditing = false;
let previousTestEditingKey = null;
DOM.previousTestPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.previousTestPopup.popup);
  resetPreviousTestPopup();
});
DOM.previousTestPopup.inputs.title.addEventListener("input", () => {
  if (DOM.previousTestPopup.inputs.title.value.length == 13) {
    DOM.previousTestPopup.inputs.title.value =
      DOM.previousTestPopup.inputs.title.value.slice(0, 12);
    DOM.previousTestPopup.errors.title.textContent =
      "Max 12 characters reached";
    showElement(DOM.previousTestPopup.errors.title);
  } else {
    hideElement(DOM.previousTestPopup.errors.title);
  }
});
DOM.previousTestPopup.inputs.duration.addEventListener("input", () => {
  if (DOM.previousTestPopup.inputs.duration.value.length == 3) {
    DOM.previousTestPopup.errors.duration.textContent =
      "Max time can be 99 min";
    DOM.previousTestPopup.inputs.duration.value =
      DOM.previousTestPopup.inputs.duration.value.slice(0, 2);
    showElement(DOM.previousTestPopup.errors.duration);
  } else {
    hideElement(DOM.previousTestPopup.errors.duration);
  }
});
DOM.previousTestPopup.inputs.resultFile.addEventListener("change", () => {
  const file = DOM.previousTestPopup.inputs.resultFile.files[0];
  if (file) {
    if (file.size > 20000000) {
      DOM.previousTestPopup.errors.result.textContent =
        "File size must be less than 20 mb";
      showElement(DOM.previousTestPopup.errors.result);
      DOM.previousTestPopup.inputs.resultFile.value = "";
      return;
    }
    DOM.previousTestPopup.attachments.result.icon.classList.add("hidden");
    DOM.previousTestPopup.attachments.result.text.textContent =
      "1 file uploaded";
  }
});
DOM.previousTestPopup.attachments.result.inputWrapper.addEventListener(
  "click",
  () => {
    DOM.previousTestPopup.inputs.resultFile.click();
  },
);
DOM.previousTestPopup.inputs.answerFile.addEventListener("change", () => {
  const file = DOM.previousTestPopup.inputs.answerFile.files[0];
  if (file) {
    if (file.size > 20000000) {
      DOM.previousTestPopup.errors.answer.textContent =
        "File size must be less than 20mb";
      DOM.previousTestPopup.inputs.answerFile.value = "";
      showElement(DOM.previousTestPopup.errors.answer);
      return;
    }
    DOM.previousTestPopup.attachments.answer.icon.classList.add("hidden");
    DOM.previousTestPopup.attachments.answer.text.textContent =
      "1 file uploaded";
  }
});
DOM.previousTestPopup.attachments.answer.inputWrapper.addEventListener(
  "click",
  () => {
    DOM.previousTestPopup.inputs.answerFile.click();
  },
);
DOM.previousTest.addContentBtn.addEventListener("click", () => {
  fadeInEffect(DOM.previousTestPopup.popup);
});
DOM.previousTestPopup.inputs.date.addEventListener("input", () => {
  DOM.previousTestPopup.fakeDatePlaceholder.focus();
  hideElement(DOM.previousTestPopup.fakeDatePlaceholder);
});
DOM.previousTestPopup.inputs.date.addEventListener("click", () => {
  if (DOM.previousTestPopup.inputs.date.showPicker) {
    DOM.previousTestPopup.inputs.date.showPicker();
  } else {
    DOM.previousTestPopup.inputs.date.focus();
  }
});
DOM.previousTestPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.previousTestPopup.errors.date);
  hideElement(DOM.previousTestPopup.errors.duration);
  hideElement(DOM.previousTestPopup.errors.title);
  hideElement(DOM.previousTestPopup.errors.answer);
  hideElement(DOM.previousTestPopup.errors.result);
  const title = DOM.previousTestPopup.inputs.title.value.trim();
  const date = DOM.previousTestPopup.inputs.date.value;
  const duration = DOM.previousTestPopup.inputs.duration.value.trim();
  const answerFile = DOM.previousTestPopup.inputs.answerFile.files[0];
  const resultFile = DOM.previousTestPopup.inputs.resultFile.files[0];
  let isError = false;
  let answerAttachmentUrl;
  let answerAttachmentId;
  let resultAttachmentUrl;
  let resultAttachmentId;
  if (!title) {
    DOM.previousTestPopup.errors.title.textContent = "Title is required";
    showElement(DOM.previousTestPopup.errors.title);
    isError = true;
  }
  if (!date) {
    DOM.previousTestPopup.errors.date.textContent = "Date is required";
    showElement(DOM.previousTestPopup.errors.date);
    isError = true;
  }
  if (!duration) {
    DOM.previousTestPopup.errors.duration.textContent = "Duration is required";
    showElement(DOM.previousTestPopup.errors.duration);
    isError = true;
  }
  if (isPreviousTestEditing) {
    if (isError) return;
  }
  if (isPreviousTestEditing) {
    showSectionLoader("Updating data....");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/previousTestList/${previousTestEditingKey}`,
      {
        title: title,
        date: date,
        duration: duration,
      },
    );
  } else {
    if (!answerFile) {
      DOM.previousTestPopup.errors.answer.textContent =
        "Answer file is required";
      showElement(DOM.previousTestPopup.errors.answer);
      isError = true;
    }
    if (!resultFile) {
      DOM.previousTestPopup.errors.result.textContent =
        "Result file is required";
      showElement(DOM.previousTestPopup.errors.result);
      isError = true;
    }
    if (isError) return;
    showSectionLoader("Uploading answer key...");
    let uploaded = await uploadDriveFile(
      answerFile,
      `${appState.activeSem}/divisionData/division${appState.activeDiv}/previousTestData/answerKey`,
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
      `${appState.activeSem}/divisionData/division${appState.activeDiv}/previousTestData/result`,
    );
    if (!resultUploaded) {
      hideSectionLoader();
      return;
    }
    resultAttachmentUrl = resultUploaded.webViewLink;
    resultAttachmentId = resultUploaded.fileId;
    showSectionLoader("Adding data....");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/previousTestList`,
      {
        title: title,
        date: date,
        duration: duration,
        answerFileId: answerAttachmentId,
        resultFileId: resultAttachmentId,
        answerFileUrl: answerAttachmentUrl,
        resultFileUrl: resultAttachmentUrl,
      },
    );
  }
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.previousTestPopup.popup);
  await syncDbData();
  resetPreviousTestPopup();
  await loadTestSection();
  await hideSectionLoader();
  showTestsSection();
});
DOM.previousTestPopup.deleteBtn.addEventListener("click", async () => {
  if (!isPreviousTestEditing) return;
  const isConfirmed = await showConfirmationPopup(
    "Are you sure you want to delete this test? This action cannot be undone.",
  );
  if (!isConfirmed) return;
  const resultId =
    appState.divisionData.testData.previousTestList[previousTestEditingKey]
      .resultFileId;
  const answerId =
    appState.divisionData.testData.previousTestList[previousTestEditingKey]
      .answerFileId;
  showSectionLoader("Deleting result from Drive...");
  await deleteDriveFile(resultId);
  showSectionLoader("Deleting answer key from Drive...");
  await deleteDriveFile(answerId);
  showSectionLoader("Deleting test...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/testData/previousTestList/${previousTestEditingKey}`,
  );
  resetPreviousTestPopup();
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.previousTestPopup.popup);
  await syncDbData();
  await loadTestSection();
  await hideSectionLoader();
  await hideSectionLoader();
  showTestsSection();
});
function renderPreviousTestCard() {
  const previousTestsdata =
    appState.divisionData.testData?.previousTestList || {};
  if (Object.keys(previousTestsdata).length === 0 || !previousTestsdata) {
    showElement(DOM.previousTest.noPreviousTest);
    return;
  }
  hideElement(DOM.previousTest.noPreviousTest);
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
      "lg:max-w-[31.24rem]",
      "p-6",
      "editor-hover-pointer",
    );
    const wrapper = document.createElement("div");
    wrapper.classList.add(
      "wrapper",
      "w-full",
      "flex",
      "items-center",
      "justify-between",
    );
    const iconNameWrapper = document.createElement("div");
    iconNameWrapper.classList.add(
      "flex",
      "items-center",
      "gap-2",
      "lg:gap-3",
      "icon-name-wrapper",
    );
    const icon = document.createElement("div");
    icon.className =
      "icon bg-primary flex h-[3rem] w-[3rem] items-center justify-center rounded-full";
    icon.innerHTML = `  <svg
  width="1.9rem"
  height="2.47rem"
  viewBox="0 0 20 26"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <image
    width="20"
    height="26"
    x="0"
    y="0"
    xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdElEQVR4nO2TQQqAQAhFvVYdIjpJXbtbvDbtWiRqIyM+cDMoPviOSGMEOIHrqWP08p03W+QCLQuwapvDBcTYrxaQj7fo2TkEtNQT8NAClIgA5dGl/QL5W8BDDQGyIyBbwEMNAbIjIFvAQwtgjSCaeQQaGcgNJKA3wwCTxc8AAAAASUVORK5CYII="
  ></image>
</svg>`;
    icon.alt = "";
    const testTitle = document.createElement("p");
    testTitle.classList.add("text-xl", "font-semibold");
    testTitle.textContent = title.charAt(0).toUpperCase() + title.slice(1);
    iconNameWrapper.appendChild(icon);
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
      "gap-1",
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
    DOM.previousTest.cardContainer.appendChild(card);
    resultBtn.addEventListener("click", (e) => {
      if (appState.isEditing) {
        e.preventDefault();
      }
    });
    answerLink.addEventListener("click", (e) => {
      if (appState.isEditing) {
        e.preventDefault();
      }
    });
    card.addEventListener("click", () => {
      if (appState.isEditing) {
        editPreviousTestCard(key);
      }
    });
  }
}
function editPreviousTestCard(key) {
  const data = appState.divisionData.testData.previousTestList[key];
  isPreviousTestEditing = true;
  previousTestEditingKey = key;
  DOM.previousTestPopup.inputs.title.value = data.title;
  DOM.previousTestPopup.inputs.date.value = data.date;
  DOM.previousTestPopup.inputs.duration.value = data.duration;
  DOM.previousTestPopup.popupTitle.textContent = "Edit test";
  DOM.previousTestPopup.successBtn.textContent = "Update";
  showElement(DOM.previousTestPopup.deleteBtn);
  hideElement(DOM.previousTestPopup.fakeDatePlaceholder);
  hideElement(DOM.previousTestPopup.attachments.answer.inputWrapper);
  hideElement(DOM.previousTestPopup.attachments.result.inputWrapper);
  fadeInEffect(DOM.previousTestPopup.popup);
}
function resetPreviousTestPopup() {
  fadeOutEffect(DOM.previousTestPopup.popup);
  DOM.previousTestPopup.inputs.title.value = "";
  DOM.previousTestPopup.inputs.date.value = "";
  DOM.previousTestPopup.inputs.duration.value = "";
  DOM.previousTestPopup.popupTitle.textContent = "Add test";
  DOM.previousTestPopup.successBtn.textContent = "Create";
  DOM.previousTestPopup.attachments.result.text.textContent =
    "Upload Result Pdf";
  DOM.previousTestPopup.attachments.answer.text.textContent =
    "Upload Answer Pdf";
  hideElement(DOM.previousTestPopup.deleteBtn);
  hideElement(DOM.previousTestPopup.errors.date);
  hideElement(DOM.previousTestPopup.errors.duration);
  hideElement(DOM.previousTestPopup.errors.title);
  hideElement(DOM.previousTestPopup.errors.answer);
  hideElement(DOM.previousTestPopup.deleteBtn);
  hideElement(DOM.previousTestPopup.errors.result);
  showElement(DOM.previousTestPopup.attachments.answer.icon);
  showElement(DOM.previousTestPopup.attachments.result.icon);
  showElement(DOM.previousTestPopup.attachments.answer.inputWrapper);
  showElement(DOM.previousTestPopup.attachments.result.inputWrapper);
  showElement(DOM.previousTestPopup.fakeDatePlaceholder);
  isPreviousTestEditing = false;
  previousTestEditingKey = null;
}
