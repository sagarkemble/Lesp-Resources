import { showSectionLoader, hideSectionLoader } from "./index.js";
import { showErrorSection } from "./error.js";
import * as Sentry from "@sentry/browser";
export async function deleteDriveFile(attachmentId) {
  if (!attachmentId) return false;
  try {
    const res = await fetch("https://vercel-server-neon-nu.vercel.app/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: attachmentId }),
    });

    const data = await res.json();
    console.log("Drive delete response:", data);

    if (!res.ok || data.success === false) {
      console.error(
        "Attachment deletion failed:",
        data.error || "Unknown error",
      );
      showErrorSection();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error deleting attachment from Drive:", err.message);
    Sentry.captureException(err);
    showErrorSection();
    return false;
  }
}
export async function uploadDriveFile(file, path) {
  if (!file || !path) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  //   showSectionLoader("Uploading file...");

  try {
    const response = await fetch(
      "https://vercel-server-neon-nu.vercel.app/upload",
      // "https://lesp-resources-gdrive-api.onrender.com/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();
    console.log("Drive upload response:", result);

    if (!result.success) {
      showErrorSection();

      console.error("File upload failed:", result.error);
      return null;
    }

    return {
      webViewLink: result.webViewLink,
      fileId: result.fileId,
    };
  } catch (err) {
    showErrorSection();
    console.error("Upload error:", err.message);
    Sentry.captureException(err);
    return null;
  }
}
