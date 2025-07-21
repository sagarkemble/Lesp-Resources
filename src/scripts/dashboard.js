import { appState } from "./appstate.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
import { hideSections } from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
export async function loadDashboard() {
  // rederNotices();
}
export async function showDashboard() {
  headerTitle.textContent = `Hello ${appState.userData.firstName}`;
  await hideSections(false, true, true);
  await fadeInEffect(dashboardSection);
}
const dashboardSection = document.querySelector(".dashboard-section");
const addNoticePopup = dashboardSection.querySelector(
  ".add-notice-popup-wrapper"
);
const swiper = new Swiper("#dashboard-page-swiper", {
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
    size: "10px",
    nextEl: ".custom-swiper-button-next",
    prevEl: ".custom-swiper-button-prev",
  },

  observer: true,
  observeParents: true,
});
async function rederNotices() {
  if (!appState.subjectData.notice) return;
  const subjectNotice = appState.subjectData.notice;
  for (const key in subjectNotice) {
    const noticeEntries = Object.entries(subjectNotice[key]).reverse();
    for (const [key, noticeData] of noticeEntries) {
      const swiperSlide = document.createElement("div");
      swiperSlide.className =
        "swiper-slide w-full max-w-[600px] bg-surface-2 !flex flex-col gap-4 lg:gap-5 rounded-2xl p-4 lg:p-5";
      const topWrapper = document.createElement("div");
      topWrapper.className = "wrapper flex items-center gap-4  justify-between";

      const iconTitleWrapper = document.createElement("div");
      iconTitleWrapper.className =
        "slide-icon-title-wrapper w-full flex items-center gap-2 lg:gap-3";

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
      description.textContent = noticeData.description;

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
        const popupAttachment = document.getElementById(
          "popup-attachment-link"
        );
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
}
const addNoticeBtn = dashboardSection.querySelector(".add-notice-btn");
addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(addNoticePopup);
});
