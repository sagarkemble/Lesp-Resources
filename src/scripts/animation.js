export async function fadeInEffect(element) {
  element.classList.remove("hidden");
  element.style.opacity = "0";
  const durationStr = getComputedStyle(element).transitionDuration;
  let ms;
  if (durationStr.endsWith("ms")) {
    ms = parseFloat(durationStr);
  } else if (durationStr.endsWith("s")) {
    ms = parseFloat(durationStr) * 1000;
  }
  console.log("this is called");
  element.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fadeOutEffect(element) {
  if (element.classList.contains("hidden")) {
    console.log("containes hidden");
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
  element.classList.add("hidden");
}
