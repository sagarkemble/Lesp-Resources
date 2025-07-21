export async function fadeInEffect(element) {
  // if (getComputedStyle(element).transitionDuration !== "0s") {
  //   console.log("Yes has transition ");
  // } else {
  //   console.log("No doesnt have transition");
  // }
  if (!element.classList.contains("hidden")) {
    // console.log("containes hidden");
    return;
  }
  element.classList.remove("hidden");
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  // console.log("this is called");
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fadeOutEffect(element) {
  if (element.classList.contains("hidden")) {
    // console.log("containes hidden");
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  if (durationStr === "0s") {
    element.classList.add("hidden");
    return;
  }
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
  element.classList.add("hidden");
}
export async function fadeInEffectOpacity(element) {
  if (element.style.opacity !== "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export async function fadeOutEffectOpacity(element) {
  if (element.style.opacity === "0") {
    return;
  }
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
function fadeOut(element, duration = 0.3) {
  gsap.to(element, {
    opacity: 0,
    duration: duration,
    onComplete: () => {
      element.classList.add("hidden"); // hide after fade out
    },
  });
}
function fadeIn(element, duration = 0.3) {
  // First, make sure it's visible
  element.classList.remove("hidden");
  gsap.set(element, { opacity: 0 }); // start from 0
  gsap.to(element, {
    opacity: 1,
    duration: duration,
  });
}
