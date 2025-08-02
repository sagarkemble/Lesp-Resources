import { deleteData, pushData, updateData } from "./firebase.js";
import { deleteDriveFile, uploadDriveFile } from "./driveApi.js";
import { appState, syncDbData } from "./appstate.js";
import {
  fadeInEffect,
  fadeInEffectOpacity,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import {
  hideSections,
  showSectionLoader,
  hideSectionLoader,
  applyEditModeUI,
  showConfirmationPopup,
} from "./index.js";
import { headerIcon, headerTitle, subjectSelectorPopup } from "./navigation.js";
import { showErrorSection } from "./error.js";
const subjectPageSection = document.querySelector(".subject-page-section");
export async function loadSubjectSection() {
  await unloadSubjectSection();
  await renderNoticeSlider();
  await renderUpcomingSubmissions();
  await renderResources();
  headerIcon.src = appState.subjectMetaData[appState.activeSubject].iconLink;
  headerTitle.textContent =
    appState.subjectMetaData[appState.activeSubject].name;
  await hideSections();
  swiper.slideTo(0, 0);
  swiper.update();
  await applyEditModeUI();
  await fadeInEffect(subjectPageSection);
}
async function unloadSubjectSection() {
  await fadeOutEffect(subjectPageSection);
  document.querySelectorAll(".dynamic-container").forEach((container) => {
    container.remove();
  });
  swiper.removeAllSlides();

  upcomingSubmissionCardContainer.innerHTML = "";
}

// notice related functions and var
const swiper = new Swiper("#subject-page-swiper", {
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
// const swiperNxtBtn = document.querySelector(".custom-swiper-button-next");
// const swiperPrevBtn = document.querySelector(".custom-swiper-button-prev");
const addNoticeBtn = subjectPageSection.querySelector(".add-notice-btn");
// main add notice popup
const addNoticePopup = subjectPageSection.querySelector(
  ".add-notice-popup-wrapper"
);
//button inside popup
const addNoticePopupcloseBtn = addNoticePopup.querySelector(".close-popup-btn");
const addNoticePopupcreateBtn = addNoticePopup.querySelector(".create-btn");
// inputs
const addNoticeTitleInput = addNoticePopup.querySelector(".title-input");
const addNoticefileInput = addNoticePopup.querySelector("#notice-file-input");
const addNoticeDescriptionInput =
  addNoticePopup.querySelector(".description-input");
const addNoticeLinkInput = addNoticePopup.querySelector(".link-input");
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
// functions
async function renderNoticeSlider() {
  const noticeList =
    appState.divisionData?.noticeData?.subjectNoticeData?.[
      appState.activeSubject
    ] || {};
  if (!noticeList || !Object.keys(noticeList).length) return; // if no notice data, return
  const noticeReversedObj = Object.entries(noticeList).reverse();
  for (const [key, noticeData] of noticeReversedObj) {
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
      deleteNotice(key, noticeData.attachmentId);
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
    swiper.appendSlide(swiperSlide);
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
document
  .getElementById("close-readmore-popup")
  ?.addEventListener("click", () => {
    document.getElementById("readmore-popup")?.classList.add("hidden");
  });
async function deleteNotice(key, attachmentId) {
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
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}/${key}`
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await hideSectionLoader();
  loadSubjectSection();
}
function resetAddNoticePopup() {
  addNoticeTitleInput.value = "";
  addNoticeDescriptionInput.value = "";
  addNoticefileInput.value = "";
  addNoticeLinkInput.value = "";
  addNotivePopupFileAttachmentText.textContent = "Upload (Optional)";
  fadeInEffect(addNoticePopupFileAttachmentIcon);
  fadeOutEffect(addNoticePopupLinkError);
  fadeOutEffect(addNoticePopupdescriptionError);
  fadeOutEffect(addNoticePopuptitleError);
} //

// listeners
addNoticeFileAttachment.addEventListener("click", () => {
  addNoticefileInput.click();
}); //
addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(addNoticePopup);
}); //
addNoticeTitleInput.addEventListener("input", () => {
  if (addNoticeTitleInput.value.length == 20) {
    addNoticePopuptitleError.textContent = "Max 20 characters reached";
    showElement(addNoticePopuptitleError);
  } else {
    hideElement(addNoticePopuptitleError);
  }
});
addNoticePopupcloseBtn.addEventListener("click", async (e) => {
  await fadeOutEffect(addNoticePopup);
  resetAddNoticePopup();
}); //
addNoticePopupcreateBtn.addEventListener("click", async () => {
  const title = addNoticeTitleInput.value.trim();
  const description = addNoticeDescriptionInput.value.trim();
  const file = addNoticefileInput.files[0];
  fadeOutEffect(addNoticePopuptitleError);
  fadeOutEffect(addNoticePopupdescriptionError);
  fadeOutEffect(addNoticePopupLinkError);
  const link = addNoticeLinkInput.value.trim();
  fadeOutEffect(addNoticePopupLinkError);
  let hasError = false;
  if (!title) {
    addNoticePopuptitleError.textContent = "Title is required";
    fadeInEffect(addNoticePopuptitleError);
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
    let uploaded = await uploadDriveFile(
      file,
      `${appState.activeSem}/divisionData/division${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}`
    );
    if (!uploaded) return;
    attachmentURL = uploaded.webViewLink;
    attachmentId = uploaded.fileId;
  } else if (link) {
    attachmentURL = link;
    attachmentId = "custom-link";
  }
  showSectionLoader("Adding notice...");
  await pushData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}`,
    {
      title,
      description,
      attachmentURL,
      attachmentId,
      createdAt: Date.now(),
      scope: appState.activeSubject,
    }
  );
  fadeOutEffect(addNoticePopup);
  resetAddNoticePopup();
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await hideSectionLoader();
  loadSubjectSection();
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
}); //
addNoticePopupErrorPopupOkayBtn.addEventListener("click", async () => {
  await fadeOutEffect(addNoticePopup);
  fadeOutEffect(addNoticePopupErrorPopup);
  resetAddNoticePopup();
}); //

//
// add category related var and fucntion
let isCategoryEditing = false;
let selectedCategoryId = null;
const addCategoryBtn = document.querySelector(".add-category-container-btn");
const addCategoryPopup = document.querySelector(".add-category-popup-wrapper");
const addCategoryPopupTitle = addCategoryPopup.querySelector(".popup-title");
//popup buttons
const addCategoryPopupCloseBtn =
  addCategoryPopup.querySelector(".close-popup-btn");
const addCategoryPopupCreateBtn = addCategoryPopup.querySelector(".create-btn");
// inputs
const addCategoryTitleInput = addCategoryPopup.querySelector(".title-input");
const addCategoryTitleError = addCategoryPopup.querySelector(
  ".title-related-error"
);
// listners
addCategoryBtn.addEventListener("click", () => {
  fadeInEffect(addCategoryPopup);
});
addCategoryPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(addCategoryPopup);
  resetAddCategoryPopup();
});
addCategoryPopupCreateBtn.addEventListener("click", async () => {
  const title = addCategoryTitleInput.value.trim();
  addCategoryTitleError.classList.add("hidden");
  if (!title) {
    addCategoryTitleError.textContent = "Title is required";
    fadeInEffect(addCategoryTitleError);
    return;
  }
  if (isCategoryEditing) {
    await showSectionLoader("Updating category...");
    updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/metaData`,
      { name: title }
    );
  } else {
    showSectionLoader("Adding category...");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList`,
      { metaData: { name: title, isVisible: true } }
    );
  }
  await fadeOutEffect(addCategoryPopup);
  resetAddCategoryPopup();
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  loadSubjectSection();
});
addCategoryTitleInput.addEventListener("input", () => {
  if (addCategoryTitleInput.value.length == 20) {
    addCategoryTitleError.textContent = "Max 20 characters reached";
    showElement(addCategoryTitleError);
  } else {
    hideElement(addCategoryTitleError);
  }
});
async function deleteCategory() {
  const confirm = await showConfirmationPopup(
    "All the content in this category will be deleted forever"
  );
  if (!confirm) return;
  showSectionLoader("Deleting category...");
  const data =
    appState.subjectData[appState.activeSubject].containerList[
      selectedCategoryId
    ];
  showSectionLoader("Deleting individual content...");
  for (const key in data.itemList) {
    const element = data.itemList[key];
    if (element.attachmentId === "custom-link") continue;
    await deleteDriveFile(element.attachmentId);
  }
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}`
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  loadSubjectSection();
  hideSectionLoader();
}
async function resetAddCategoryPopup() {
  fadeInEffect(addItemPopupCreateBtn);
  addCategoryTitleInput.value = "";
  fadeOutEffect(addCategoryTitleError);
  isCategoryEditing = false;
  selectedCategoryId = null;
  addCategoryPopupCreateBtn.textContent = "Create";
  addCategoryPopupTitle.textContent = "Add Category";
}
function editCategory() {
  addCategoryTitleInput.value =
    appState.subjectData[appState.activeSubject].containerList[
      selectedCategoryId
    ].metaData.name;
  isCategoryEditing = true;
  addCategoryPopupCreateBtn.textContent = "Edit";
  addCategoryPopupTitle.textContent = "Edit Category";
  fadeInEffect(addCategoryPopup);
}
async function toggleCategoryVisibility() {
  const confirm = await showConfirmationPopup(
    "All the content in this category will not be visible to students until you unhide it"
  );
  if (!confirm) return;
  await showSectionLoader("Changing visibility...");
  updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/metaData`,
    {
      isVisible:
        !appState.subjectData[appState.activeSubject].containerList[
          selectedCategoryId
        ].metaData.isVisible,
    }
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  loadSubjectSection();
}
//
///
///
///
///
///
///
///
///
///
///
///
///

// individual resource item related var and functions

// individual item var and function
let isItemEditing = false;
let selectedItemId = null;
let originalLink = "";
let originalAttachmentId = "";
const addItemPopup = document.querySelector(".add-item-popup-wrapper");
const addItemPopupTitle = addItemPopup.querySelector(".popup-title");
//popup buttons
const addItemPopupCloseBtn = addItemPopup.querySelector(".close-popup-btn");
const addItemPopupCreateBtn = addItemPopup.querySelector(".create-btn");
const addItemPopupChangeAttachmentBtn = addItemPopup.querySelector(
  ".change-attachment-btn"
);
// inputs
const addItemPopupTitleInput = addItemPopup.querySelector(".title-input");
const addItemPopupLinkInput = addItemPopup.querySelector(".link-input");
const addItemPopupFileInput = addItemPopup.querySelector("#item-file-input");
// error msgs
const addItemPopupTitleError = addItemPopup.querySelector(".title-error");
const addItemPopupLinkError = addItemPopup.querySelector(".link-error");
// error popup
const addItemPopupErrorPopup = addItemPopup.querySelector(
  ".error-popup-wrapper "
);
const addItemPopupErrorPopupOkBtn = addItemPopup.querySelector(
  ".error-popup-wrapper .okay-btn"
);
// editor icons
const addItemPopupEditTools = addItemPopup.querySelector(".edit-tools");
const addItemPopupHideIcon = addItemPopup.querySelector(".hide-icon");
const addItemPopupUnhideIcon = addItemPopup.querySelector(".unhide-icon");
const addItemPopupDeleteIcon = addItemPopup.querySelector(".delete-icon");
// file attachment ui
const addItemPopupFileAttachment =
  addItemPopup.querySelector(".upload-attachment");
const addItemPopupFileAttachmentText = addItemPopup.querySelector(
  ".upload-attachment .upload-text"
);
const addItemPopupFileAttachmentIcon = addItemPopup.querySelector(
  ".upload-attachment .upload-attachment-icon "
);
const addItemPopupOrLine = addItemPopup.querySelector(".or-line");
const addItemPopupLinkInputLabel =
  addItemPopup.querySelector(".link-input-label");
function resetAddItemPopup() {
  addItemPopupTitleInput.value = "";
  addItemPopupLinkInput.value = "";
  addItemPopupFileInput.value = "";
  addItemPopupCreateBtn.textContent = "Create";
  addItemPopupFileAttachmentText.textContent = "Upload (Optional)";
  addItemPopupTitle.textContent = "Add Item";
  fadeInEffect(addItemPopupLinkInputLabel);
  fadeInEffect(addItemPopupLinkInput);
  fadeInEffect(addItemPopupFileAttachmentIcon);
  fadeInEffect(addItemPopupFileAttachment);
  fadeInEffect(addItemPopupOrLine);
  fadeOutEffect(addItemPopupTitleError);
  fadeOutEffect(addItemPopupLinkError);
  fadeOutEffect(addItemPopupChangeAttachmentBtn);
  fadeOutEffect(addItemPopupEditTools);
  originalAttachmentId = "";
  originalLink = "";
  isItemEditing = false;
  selectedItemId = null;
}
function editItem(itemId, categoryId, link, attachmentId, title, visible) {
  selectedItemId = itemId;
  selectedCategoryId = categoryId;
  originalLink = link;
  originalAttachmentId = attachmentId || "custom-link";
  isItemEditing = true;
  addItemPopupTitleInput.value = title;
  addItemPopupLinkInput.value = link;
  addItemPopupFileInput.value = "";
  addItemPopupTitle.textContent = "Edit Item";
  addItemPopupCreateBtn.textContent = "Update";
  fadeOutEffect(addItemPopupLinkInputLabel);
  fadeOutEffect(addItemPopupLinkInput);
  fadeInEffect(addItemPopupEditTools);
  fadeInEffect(addItemPopupDeleteIcon);
  if (visible === false) {
    fadeInEffect(addItemPopupUnhideIcon);
    fadeOutEffect(addItemPopupHideIcon);
  } else {
    fadeOutEffect(addItemPopupUnhideIcon);
    fadeInEffect(addItemPopupHideIcon);
  }
  fadeInEffect(addItemPopupChangeAttachmentBtn);
  fadeOutEffect(addItemPopupFileAttachment);
  fadeOutEffect(addItemPopupOrLine);
  addItemPopupCreateBtn.textContent = "Edit";
  fadeInEffect(addItemPopup);
}
addItemPopupChangeAttachmentBtn.addEventListener("click", () => {
  fadeInEffect(addItemPopupCreateBtn);
  fadeInEffect(addItemPopupFileAttachment);
  fadeInEffect(addItemPopupLinkInput);
  fadeInEffect(addItemPopupLinkInputLabel);
  addItemPopupLinkInput.value = "";
  fadeOutEffect(addItemPopupChangeAttachmentBtn);
});
addItemPopupFileAttachment.addEventListener("click", () => {
  addItemPopupFileInput.click();
});
addItemPopupCloseBtn.addEventListener("click", async () => {
  await fadeOutEffect(addItemPopup);
  resetAddItemPopup();
});
addItemPopupErrorPopupOkBtn.addEventListener("click", async () => {
  fadeOutEffect(addItemPopup);
  await fadeOutEffect(addItemPopupErrorPopup);
  resetAddItemPopup();
});
addItemPopupFileInput.addEventListener("change", () => {
  const file = addItemPopupFileInput.files[0];
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      addNoticefileInput.value = "";
      addItemPopupLinkError.textContent = "File too large (max 20MB)";
      fadeInEffect(addItemPopupLinkError);
      return;
    }
    fadeOutEffect(addItemPopupFileAttachmentIcon);
    addItemPopupFileAttachmentText.textContent = "1 file attached";
  } else {
    resetAddItemPopup();
  }
});
addItemPopupCreateBtn.addEventListener("click", async () => {
  const title = addItemPopupTitleInput.value.trim();
  const link = addItemPopupLinkInput.value.trim();
  const file = addItemPopupFileInput.files[0];
  fadeOutEffect(addItemPopupTitleError);
  fadeOutEffect(addItemPopupLinkError);
  let iserror = false;
  if (!title) {
    addItemPopupTitleError.textContent = "Title is required";
    fadeInEffect(addItemPopupTitleError);
    iserror = true;
  }

  if (!link && !file) {
    addItemPopupLinkError.textContent = "Link or file is required";
    fadeInEffect(addItemPopupLinkError);
    iserror = true;
  }
  if (file && link) {
    fadeInEffect(addItemPopupErrorPopup);
    return;
  }
  if (link && !/^https?:\/\//.test(link)) {
    addItemPopupLinkError.textContent =
      "Enter a valid link starting with http:// or https://";
    fadeInEffect(addItemPopupLinkError);
    iserror = true;
  }
  if (iserror) return;
  let attachmentURL = "";
  let attachmentId = "";
  if (file) {
    showSectionLoader("Uploading file...");

    let uploaded = await uploadDriveFile(
      file,
      `${appState.activeSem}/divisionData/division${appState.activeDiv}/subjectData/${appState.activeSubject}/${selectedCategoryId}`
    );
    if (!uploaded) return;
    attachmentURL = uploaded.webViewLink;
    attachmentId = uploaded.fileId;
    console.log("Uploaded file ID:", attachmentId);
    console.log(attachmentId);
  } else {
    attachmentURL = link;
    if (link !== originalLink) {
      attachmentId = "custom-link";
    } else {
      attachmentId = originalAttachmentId;
    }
  }
  if (isItemEditing) {
    if (originalAttachmentId !== attachmentId) {
      showSectionLoader("Deleting old file...");
      await deleteDriveFile(originalAttachmentId);
    }
    showSectionLoader("Updating item...");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
      {
        name: title,
        link: attachmentURL,
        attachmentId,
      }
    );
  } else {
    showSectionLoader("Adding item...");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList`,
      {
        name: title,
        link: attachmentURL,
        attachmentId,
        createdAt: Date.now(),
        isVisible: true,
      }
    );
  }
  fadeOutEffect(addItemPopup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  resetAddItemPopup();
  loadSubjectSection();
});
addItemPopupUnhideIcon.addEventListener("click", async () => {
  let confirm = await showConfirmationPopup(
    "Are you sure you want to unhide this item?"
  );
  if (!confirm) return;
  showSectionLoader("Unhiding item...");
  updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
    { isVisible: true }
  );
  fadeOutEffect(addItemPopup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  resetAddItemPopup();
  loadSubjectSection();
});
addItemPopupTitleInput.addEventListener("input", () => {
  if (addItemPopupTitleInput.value.length == 12) {
    addItemPopupTitleError.textContent =
      "Max 12 characters reached (Use short words like Exp, Asign, etc)";
    fadeInEffect(addItemPopupTitleError);
  } else {
    fadeOutEffect(addItemPopupTitleError);
  }
});
addItemPopupHideIcon.addEventListener("click", async () => {
  let confirm = await showConfirmationPopup(
    "Are you sure you want to hide this item?"
  );
  if (!confirm) return;
  showSectionLoader("Hiding item...");
  updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
    { isVisible: false }
  );
  fadeOutEffect(addItemPopup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  resetAddItemPopup();
  loadSubjectSection();
});
addItemPopupDeleteIcon.addEventListener("click", async () => {
  let confirm = await showConfirmationPopup(
    "Are you sure you want to delete this item?"
  );
  if (!confirm) return;
  if (
    appState.subjectData[appState.activeSubject].containerList[
      selectedCategoryId
    ].itemList[selectedItemId].attachmentId !== "custom-link"
  ) {
    showSectionLoader("Deleting uploaded attachment...");
    await deleteDriveFile(originalAttachmentId);
    showSectionLoader("Deleting item...");
  }
  deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`
  );
  fadeOutEffect(addItemPopup);
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  resetAddItemPopup();
  loadSubjectSection();
});
function renderResources() {
  const categoryData =
    appState.subjectData?.[appState.activeSubject]?.containerList || {};
  if (!categoryData || !Object.keys(categoryData).length) {
    return;
  }
  for (const categoryId in categoryData) {
    const category = categoryData[categoryId];
    const container = document.createElement("div");
    container.className =
      "category-item-container dynamic-container gap-2 lg:gap-3 flex flex-col w-full";
    const headingWrapper = document.createElement("div");
    headingWrapper.className = "gap-2 lg:gap-3 flex items-center w-full";
    const heading = document.createElement("p");
    heading.textContent = category.metaData.name;
    const plusIcon = document.createElement("div");
    plusIcon.className = "plus-icon hidden editor-tool";
    const plusIconInner = document.createElement("i");
    plusIconInner.className = "fa-solid fa-plus text-2xl cursor-pointer";
    plusIcon.appendChild(plusIconInner);
    const editIcon = document.createElement("div");
    editIcon.className = "edit-icon hidden editor-tool ml-auto";
    const editIconInner = document.createElement("i");
    editIconInner.className = "fa-solid fa-pen text-xl cursor-pointer ml-auto";
    editIcon.appendChild(editIconInner);
    const deleteIcon = document.createElement("div");
    deleteIcon.className = "delete-icon hidden editor-tool";
    const deleteIconInner = document.createElement("i");
    deleteIconInner.className =
      "fa-solid fa-trash text-xl cursor-pointer text-text-error";
    deleteIcon.appendChild(deleteIconInner);
    const visibilityIcon = document.createElement("div");
    visibilityIcon.className = "visibility-icon hidden editor-tool";
    const visibilityIconInner = document.createElement("i");
    visibilityIconInner.className = category.metaData.visible
      ? "fa-solid fa-eye-slash text-xl cursor-pointer"
      : "fa-solid fa-eye text-xl cursor-pointer";
    visibilityIcon.appendChild(visibilityIconInner);
    headingWrapper.appendChild(heading);
    headingWrapper.appendChild(plusIcon);
    headingWrapper.appendChild(editIcon);
    headingWrapper.appendChild(visibilityIcon);
    headingWrapper.appendChild(deleteIcon);
    container.appendChild(headingWrapper);
    const cardContainer = document.createElement("div");
    if (!category.metaData.isVisible) {
      console.log("Category is not visible:", category.metaData.name);
      container.classList.add("editor-only-content");
      container.classList.add("hidden");
      heading.className = "text-2xl font-semibold opacity-50";
      cardContainer.className = "card-wrapper grid-auto-fit opacity-50";
    } else {
      cardContainer.className = "card-wrapper grid-auto-fit";
      heading.className = "text-2xl font-semibold";
    }
    plusIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      fadeInEffect(addItemPopup);
    });
    deleteIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      deleteCategory();
    });
    editIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      editCategory();
    });
    visibilityIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      toggleCategoryVisibility();
    });

    const items = category?.itemList || {};
    for (const itemId in items) {
      const item = items[itemId];
      const link = document.createElement("a");
      link.href = item.link;
      link.target = "_blank";
      link.className = "w-full";
      const card = document.createElement("div");
      if (!item.isVisible) {
        card.className =
          "card p-4 w-full text-center t bg-surface-2 rounded-[20px] editor-only-content-card opacity-50";
        link.classList.add("hidden");
      } else
        card.className =
          "card p-4 w-full text-center t bg-surface-2 rounded-[20px]";

      card.textContent = item.name;
      link.appendChild(card);
      cardContainer.appendChild(link);

      // listner
      card.addEventListener("click", (e) => {
        if (appState.isEditing) {
          e.preventDefault(); // Prevent navigation
          editItem(
            itemId,
            categoryId,
            item.link,
            item.attachmentId,
            item.name,
            item.isVisible
          );
        }
      });
    }
    container.appendChild(cardContainer);
    subjectPageSection.appendChild(container);
  }
}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// upcoming submission var and function
const upcomingSubmission = subjectPageSection.querySelector(
  ".upcoming-submissions"
);
const upcomingSubmissionCardContainer = upcomingSubmission.querySelector(
  ".upcoming-submissions .card-container"
);

let isSubmissionEditing = false;
let selectedSubmissionId = null;
const addSubbmissionButton = upcomingSubmission.querySelector(
  ".add-submission-btn"
);
const addSubmissionPopup = subjectPageSection.querySelector(
  ".add-submission-popup-wrapper"
);
const addSubmissionPopupTitle =
  addSubmissionPopup.querySelector(".popup-title");
// popup buttons
const addSubmissionPopupCreateBtn =
  addSubmissionPopup.querySelector(".create-btn");
const addSubmissionPopupDeleteIcon =
  addSubmissionPopup.querySelector(".delete-icon");
const addSubmissionPopupCloseIcon =
  addSubmissionPopup.querySelector(".close-popup-btn");
const addSubmissionPopupChangeDateBtn =
  addSubmissionPopup.querySelector(".change-date-btn");
// error messages
const addSubmissionPopupTitleError = addSubmissionPopup.querySelector(
  ".title-related-error"
);
const addSubmissionPopupDescriptionError = addSubmissionPopup.querySelector(
  ".submission-description-related-error"
);
// inputs
const addSubmissionPopupTitleInput = addSubmissionPopup.querySelector(
  "#submission-title-input"
);
const addSubmissionPopupDescriptionInput = addSubmissionPopup.querySelector(
  "#submission-description-input"
);
const addSubmissionPopupDateInput = document.querySelector(
  "#submission-date-input"
);
// error popup
const addSubmissionPopupErrorPopup = addSubmissionPopup.querySelector(
  ".error-popup-wrapper "
);
const addSubmissionPopupErrorPopupOkBtn = addSubmissionPopup.querySelector(
  ".error-popup-wrapper .okay-btn"
);
const fakePlaceHolder = document.querySelector(".fake-placeholder");
const addSubmissionPopupDateInputWrapper = addSubmissionPopup.querySelector(
  ".date-input-wrapper"
);
const addSubmissionPopupDescriptionInputWrapper =
  addSubmissionPopup.querySelector(".description-input-wrapper");
const addSubmissionPopupDateOrLine =
  addSubmissionPopup.querySelector(".or-line");
addSubbmissionButton.addEventListener("click", () => {
  fadeInEffect(addSubmissionPopup);
});
addSubmissionPopupCloseIcon.addEventListener("click", async () => {
  await fadeOutEffect(addSubmissionPopup);
  resetAddUpcomingSubmissionPopup();
});
addSubmissionPopupDateInput.addEventListener("click", () => {
  openDatePicker();
});
addSubmissionPopupErrorPopupOkBtn.addEventListener("click", () => {
  fadeOutEffect(addSubmissionPopupErrorPopup);
  fadeOutEffect(addSubmissionPopup);
  resetAddUpcomingSubmissionPopup();
});
addSubmissionPopupDateInput.addEventListener("input", () => {
  fadeOutEffect(fakePlaceHolder);
});
addSubmissionPopupCreateBtn.addEventListener("click", async () => {
  let title = addSubmissionPopupTitleInput.value;
  let description = addSubmissionPopupDescriptionInput.value;
  let date = addSubmissionPopupDateInput.value;
  fadeOutEffect(addSubmissionPopupTitleError);
  fadeOutEffect(addSubmissionPopupDescriptionError);
  let isError = false;
  if (!title) {
    isError = true;
    addSubmissionPopupTitleError.textContent = "Required";
    fadeInEffect(addSubmissionPopupTitleError);
  }
  if (!description && !date) {
    isError = true;
    addSubmissionPopupDescriptionError.textContent = "Required";
    fadeInEffect(addSubmissionPopupDescriptionError);
  }
  if (description && date) {
    isError = true;
    fadeInEffect(addSubmissionPopupErrorPopup);
  }
  if (isError) return;
  if (description) {
    date = description;
  }
  if (isSubmissionEditing) {
    showSectionLoader("Updating submission...");
    updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${selectedSubmissionId}`,
      {
        name: title,
        dueDate: date,
      }
    );
  } else {
    showSectionLoader("Creating submission...");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}`,
      {
        name: title,
        dueDate: date,
      }
    );
  }
  await fadeOutEffect(addSubmissionPopup);
  resetAddUpcomingSubmissionPopup();
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  loadSubjectSection();
});
addSubmissionPopupDeleteIcon.addEventListener("click", async () => {
  const confirm = await showConfirmationPopup(
    "All the content in this category will be deleted forever"
  );
  if (!confirm) return;
  showSectionLoader("Deleting submission...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${selectedSubmissionId}`
  );
  await fadeOutEffect(addSubmissionPopup);
  resetAddUpcomingSubmissionPopup();
  showSectionLoader("Syncing data...");
  await syncDbData();
  hideSectionLoader();
  loadSubjectSection();
});
addSubmissionPopupTitleInput.addEventListener("input", () => {
  if (addSubmissionPopupTitleInput.value.length == 12) {
    addSubmissionPopupTitleError.textContent =
      "Max 12 characters reached (Use short words like Exp, Asign, etc)";
    fadeInEffect(addSubmissionPopupTitleError);
  } else {
    fadeOutEffect(addSubmissionPopupTitleError);
  }
});
function resetAddUpcomingSubmissionPopup() {
  fadeInEffect(addSubmissionPopupDateInputWrapper);
  fadeInEffect(addSubmissionPopupDescriptionInputWrapper);
  fadeOutEffect(addSubmissionPopupChangeDateBtn);
  addSubmissionPopupTitleInput.value = "";
  addSubmissionPopupDescriptionInput.value = "";
  addSubmissionPopupDateInput.value = "";
  isSubmissionEditing = false;
  selectedSubmissionId = null;
  addSubmissionPopupTitle.textContent = "Add Submission";
  addSubmissionPopupCreateBtn.textContent = "Create";
  fadeInEffect(fakePlaceHolder);
  fadeOutEffect(addSubmissionPopupDeleteIcon);
}
addSubmissionPopupChangeDateBtn.addEventListener("click", () => {
  fadeInEffect(addSubmissionPopupDateInputWrapper);
  fadeInEffect(addSubmissionPopupDateOrLine);
  fadeInEffect(addSubmissionPopupDescriptionInputWrapper);
  addSubmissionPopupDescriptionInput.value = "";
  fadeOutEffect(addSubmissionPopupChangeDateBtn);
});
function openDatePicker() {
  if (addSubmissionPopupDateInput.showPicker) {
    addSubmissionPopupDateInput.showPicker();
  } else {
    addSubmissionPopupDateInput.focus();
  }
}
function editUpcomingSubmission(submissionId) {
  fadeInEffect(addSubmissionPopupChangeDateBtn);
  fadeOutEffect(addSubmissionPopupDateInputWrapper);
  fadeOutEffect(addSubmissionPopupDescriptionInputWrapper);
  fadeOutEffect(addSubmissionPopupDateOrLine);
  addSubmissionPopupCreateBtn.textContent = "Edit";
  addSubmissionPopupTitleInput.value =
    appState.divisionData.upcomingSubmissionData[appState.activeSubject][
      submissionId
    ].name;
  addSubmissionPopupDescriptionInput.value =
    appState.divisionData.upcomingSubmissionData[appState.activeSubject][
      submissionId
    ].dueDate;
  isSubmissionEditing = true;
  selectedSubmissionId = submissionId;
  addSubmissionPopupTitle.textContent = "Edit Submission";
  fadeInEffect(addSubmissionPopupDeleteIcon);
  fadeInEffect(addSubmissionPopup);
}
async function renderUpcomingSubmissions() {
  const submissionData =
    (appState.divisionData?.upcomingSubmissionData || {})[
      appState.activeSubject
    ] || {};

  if (!submissionData || !Object.keys(submissionData).length) {
    hideElement(upcomingSubmission);
    console.log("No upcoming found");
    return;
  }
  fadeInEffect(upcomingSubmission);
  const now = new Date();
  const deleteCutoffHour = 17;
  const deleteCutoffMinute = 30;
  for (const key in submissionData) {
    let submission = submissionData[key];
    if (
      typeof submission.dueDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(submission.dueDate)
    ) {
      const [year, month, day] = submission.dueDate.split("-").map(Number);
      const deleteTime = new Date(
        year,
        month - 1,
        day,
        deleteCutoffHour,
        deleteCutoffMinute
      );
      if (now > deleteTime) {
        console.log("this is old");
        await deleteData(
          `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${key}`
        );
        delete submissionData[key];
        continue;
      }
    }
    const card = document.createElement("div");
    card.className = "card p-4 bg-surface-2 rounded-[20px] text-center";
    const description = document.createElement("p");
    description.className = "description";
    description.textContent = submission.name;
    const submissionDate = document.createElement("p");
    submissionDate.className = "submission-date";
    submissionDate.textContent = formatDateBasedOnProximity(submission.dueDate);
    card.appendChild(description);
    card.appendChild(submissionDate);
    upcomingSubmissionCardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (appState.isEditing) {
        editUpcomingSubmission(key);
      }
    });
  }
}
function formatDateBasedOnProximity(rawDate) {
  const dateObj = new Date(rawDate);
  if (isNaN(dateObj)) return rawDate; //
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);
  const day = dateObj.getDate().toString().padStart(2, "0");

  if (dateObj <= sevenDaysLater) {
    // Format: DD-Wed (within next 7 days)
    const weekday = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });
    return `${day}-${weekday}`;
  } else {
    // Format: DD-Aug (more than 7 days away)
    const month = dateObj.toLocaleDateString("en-US", {
      month: "short",
    });
    return `${day}-${month}`;
  }
}
