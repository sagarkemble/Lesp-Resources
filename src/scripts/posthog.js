import posthog from "posthog-js";

posthog.init("phc_3kfgkf3DWYBNyPopj8wCwBiGBsjHTLslCYrcAPxR6lo", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only",
});
export function trackLoginUser(uid, userEmail) {
  console.log("User logged in:", userEmail);
  posthog.identify(uid, { email: userEmail });
}
export function trackUserLogout(email) {
  posthog.capture(`${email} logged out`, { type: "logout", email });
  posthog.reset();
}
export function resetPostHog() {
  posthog.reset();
}
export function trackClass(semester, division) {
  posthog.capture(`Entered ${semester}${division} class`, {
    type: "class",
    semester,
    division,
  });
}
export function trackSubjectPage(subject, semester, division) {
  posthog.capture(`Entered ${subject} page`, {
    type: "subject",
    subject,
    semester,
    division,
  });
}
export function trackPage(page) {
  posthog.capture(`Entered ${page} page`, { type: "page", page });
}
export function trackSignup(email) {
  posthog.capture(`${email} signed up`, { type: "signup", email });
}
export function trackResetPassword(email) {
  posthog.capture(`${email} sent reset password email`, {
    type: "reset_password",
    email,
  });
}
export function trackEditEvent(page, description) {
  posthog.capture(`Edited ${page}:${description}`, {
    type: "edit",
    page,
    description,
  });
}
export function trackCreateEvent(type, page, description) {
  posthog.capture(`Created ${page}:${description}`, {
    type: "create",
    page,
    description,
  });
}
export function trackDeleteEvent(page, description) {
  posthog.capture(`Deleted ${page}:${description}`, {
    type: "delete",
    page,
    description,
  });
}
