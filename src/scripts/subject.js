const subjectPageSection = document.querySelector(".subject-page-section");
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { navIcon, navTitle } from "./navigation.js";
let swiperInstance = null;
import { db, push, ref } from "./firebase.js";
const Swiperwrapper = document.querySelector(
  "#subject-page-swiper .swiper-wrapper"
);
const addNoticeBtn = document.querySelector(".add-notice-btn");
const addNoticePopup = document.querySelector(".add-notice-popup-wrapper");
const closeFormBtn = document.querySelector(".close-form-btn");
const createNoticeBtn = document.querySelector(".create-notice-btn");
const createNoticeTitleInput = document.querySelector(
  ".add-notice-popup-wrapper #title-name-input"
);
const fileInput = document.getElementById("notice-file-input");
const createNoticeDescription = document.querySelector(
  ".add-notice-popup-wrapper .description"
);
const titleRelatedError = document.querySelector("#title-related-error");
const descriptionRelatedError = document.querySelector(
  "#description-related-error"
);
let activeSubject;
let activeSubjectObj;
let activeDiv;
let activeSem;

const upcomingSubmissionCardWrapper = document.querySelector(
  ".upcoming-submissions .card-wrapper"
);
const subjectSelectorPopup = document.querySelector(".subject-selector-popup");
const subjectSelectorPopupCardWrapper = document.querySelector(
  ".subject-selector-popup .card-wrapper"
);
let subjectData;
export async function loadSubjectSection(
  inputSubjectData,
  inputActiveSubject,
  inputActiveDiv,
  inputActiveSem
) {
  activeDiv = inputActiveDiv;
  activeSem = inputActiveSem;
  activeSubject = inputActiveSubject;
  subjectData = inputSubjectData;
  activeSubjectObj = subjectData.individualSubjects[activeSubject];
  console.log(activeSubjectObj);
  await unloadSubjectSection();
  await renderSwiper();
  await renderUpcomingSubmissions();
  await renderResources();
  navIcon.src = activeSubjectObj.icon;
  navTitle.textContent = activeSubjectObj.name;
  await hideSections();
  await fadeInEffect(subjectPageSection);
}
export async function unloadSubjectSection() {
  Swiperwrapper.innerHTML = "";
  // Destroy Swiper instance if exists
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }
  upcomingSubmissionCardWrapper.innerHTML = "";
}

function addNotice() {}

function renderSwiper() {
  // Clear previous slides
  Swiperwrapper.innerHTML = "";
  for (let key in subjectData.notice[activeSubject]) {
    const noticeData = subjectData.notice[activeSubject][key];

    const swiperSlide = document.createElement("div");
    swiperSlide.className =
      "swiper-slide max-w-[600px] bg-surface-2 !flex flex-col gap-4 lg:gap-5 rounded-2xl p-4 lg:p-5";

    // Top wrapper
    const topWrapper = document.createElement("div");
    topWrapper.className = "wrapper flex items-center justify-between";

    const iconTitleWrapper = document.createElement("div");
    iconTitleWrapper.className =
      "slide-icon-title-wrapper flex items-center gap-2 lg:gap-3";

    const icon = document.createElement("div");
    icon.className =
      "icon bg-surface flex h-10 w-10 items-center justify-center rounded-full";

    const iconInner = document.createElement("i");
    iconInner.className = "ri-file-text-line text-xl";
    icon.appendChild(iconInner);

    const title = document.createElement("p");
    title.className = "slider-title text-xl font-semibold";
    title.textContent = noticeData.title;

    iconTitleWrapper.appendChild(icon);
    iconTitleWrapper.appendChild(title);

    const tag = document.createElement("p");
    tag.className = "bg-primary-400 px-2 py-1 w-fit rounded-xl text-xs";
    tag.textContent = "New";

    topWrapper.appendChild(iconTitleWrapper);
    topWrapper.appendChild(tag);

    const wrapper2 = document.createElement("div");
    wrapper2.className = "wrapper";

    const description = document.createElement("div");
    description.className = "description text-text-secondary line-clamp-5";
    description.textContent = noticeData.description;

    const linkWrapper = document.createElement("div");
    linkWrapper.className =
      "wrapper text-text-link underline text-sm flex gap-4";

    const readmore = document.createElement("p");
    readmore.className = "cursor-pointer";
    readmore.textContent = "Readmore";
    readmore.style.display = "none";

    const attachment = document.createElement("a");
    attachment.textContent = "See attachment";
    attachment.className = "cursor-pointer hidden";
    attachment.target = "_blank";

    // Assign attachment link if available
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

    Swiperwrapper.appendChild(swiperSlide);

    requestAnimationFrame(() => {
      if (description.scrollHeight > description.clientHeight) {
        readmore.style.display = "inline";
      }
    });

    // Readmore click handler → populate popup
    readmore.addEventListener("click", () => {
      const popup = document.getElementById("readmore-popup");
      const popupTitle = document.getElementById("readmore-popup-title");
      const popupContent = document.getElementById("readmore-popup-content");
      const popupAttachment = document.getElementById("popup-attachment-link");

      popupTitle.textContent = key;
      popupContent.textContent = noticeData.description || noticeData;

      // Add attachment to popup if available
      if (noticeData.attachmentURL) {
        popupAttachment.href = noticeData.attachmentURL;
        popupAttachment.classList.remove("hidden");
      } else {
        popupAttachment.classList.add("hidden");
      }
      popup.classList.remove("hidden");
    });
  }
  swiperInstance = new Swiper("#subject-page-swiper", {
    direction: "horizontal",
    loop: true,
    slidesPerView: "auto",
    spaceBetween: 30,
    centeredSlides: true,
    pagination: {
      el: ".swiper-pagination",
    },
  });
}
document
  .getElementById("close-readmore-popup")
  .addEventListener("click", () => {
    document.getElementById("readmore-popup").classList.add("hidden");
  });
function renderUpcomingSubmissions() {
  const submissions = subjectData.upcomingSubmissions[activeSubject];
  if (!submissions || Object.keys(submissions).length === 0) {
    fadeOutEffect(upcomingSubmissionCardWrapper);
    return;
  }

  console.log(subjectData.upcomingSubmissions[activeSubject]);

  for (const key in subjectData.upcomingSubmissions[activeSubject]) {
    let submissions = subjectData.upcomingSubmissions[activeSubject][key];
    // Create the card container
    const card = document.createElement("div");
    card.className = "card p-4 bg-surface-2 rounded-[20px]";

    // Create the description paragraph
    const description = document.createElement("p");
    description.className = "description";
    description.textContent = submissions.description;

    // Create the submission-date paragraph
    const submissionDate = document.createElement("p");
    submissionDate.className = "submission-date";
    submissionDate.textContent = submissions.date;

    // Append the paragraphs to the card
    card.appendChild(description);
    card.appendChild(submissionDate);

    // Append the card to the body or any specific container
    upcomingSubmissionCardWrapper.appendChild(card);
  }
}
function renderResources() {
  console.log("this is category", activeSubjectObj.content);
  for (const category in activeSubjectObj.content) {
    const items = activeSubjectObj.content[category];

    // Create main container for this category (e.g., textbooks, notes, etc.)
    const container = document.createElement("div");
    container.className = "container gap-2 lg:gap-3 flex flex-col";

    // Add heading (like "Textbooks")
    const heading = document.createElement("p");
    heading.className = "text-2xl font-semibold";
    heading.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    container.appendChild(heading);

    // Card wrapper
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "card-wrapper grid-auto-fit";

    for (const key in items) {
      const item = items[key];
      // if (!item.visibility) continue; // Skip if not visible

      // Create individual card
      const card = document.createElement("div");
      card.className =
        "card p-4 w-full text-center t bg-surface-2 rounded-[20px]";

      const link = document.createElement("a");
      link.href = item.link;
      link.className = "text-center";
      link.textContent = item.title;

      card.appendChild(link);
      cardWrapper.appendChild(card);
    }

    container.appendChild(cardWrapper);
    subjectPageSection.appendChild(container);
  }
}
addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(addNoticePopup);
});
closeFormBtn.addEventListener("click", (e) => {
  fadeOutEffect(addNoticePopup);
});

// createNoticeBtn.addEventListener("click", () => {
//   const path = ref(
//     db,
//     `semesters/${activeSem}/divisions/${activeDiv}/subjects/notice/${activeSubject}`
//   );
//   console.log(activeDiv, activeSem, activeSubject);
//   console.log(path);
//   console.log(createNoticeDescription.value + createNoticeTitleInput.value);

//   push(path, {
//     attachmentURL: "",
//     description: createNoticeDescription.value,
//     title: createNoticeTitleInput.value,
//   })
//     .then(() => {
//       console.log("Notice added successfully");
//       createNoticeTitleInput.value = "";
//       createNoticeDescription.value = "";
//       titleRelatedError.classList.add("hidden");
//       descriptionRelatedError.classList.add("hidden");
//       fadeOutEffect(addNoticePopup);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

createNoticeBtn.addEventListener("click", async () => {
  const title = createNoticeTitleInput.value.trim();
  const description = createNoticeDescription.value.trim();
  const file = fileInput.files[0];

  // Reset errors
  titleRelatedError.classList.add("hidden");
  descriptionRelatedError.classList.add("hidden");

  let hasError = false;
  if (!title) {
    titleRelatedError.textContent = "Title is required";
    titleRelatedError.classList.remove("hidden");
    hasError = true;
  }
  if (!description) {
    descriptionRelatedError.textContent = "Description is required";
    descriptionRelatedError.classList.remove("hidden");
    hasError = true;
  }
  if (hasError) return;

  let attachmentURL = "";
  let attachmentId = "";

  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "path",
      `resources/${activeSem}/${activeDiv}/${activeSubject}`
    );

    try {
      const response = await fetch(
        "https://lesp-resources-gdrive-api.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        attachmentURL = result.webViewLink;
        attachmentId = result.fileId; // ✅ Capture the fileId
      } else {
        alert("File upload failed: " + result.error);
        return;
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while uploading file.");
      return;
    }
  }

  // Save to Firebase
  const path = ref(
    db,
    `semesters/${activeSem}/divisions/${activeDiv}/subjects/notice/${activeSubject}`
  );

  push(path, {
    attachmentURL,
    attachmentId, // ✅ Save the file ID
    title,
    description,
  })
    .then(() => {
      console.log("Notice added successfully");
      createNoticeTitleInput.value = "";
      createNoticeDescription.value = "";
      fileInput.value = "";
      fadeOutEffect(addNoticePopup);
    })
    .catch((error) => {
      console.log(error);
    });
});
