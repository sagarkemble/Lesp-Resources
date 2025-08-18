import { showErrorSection } from "./error.js";
const uploadUrl = process.env.UPLOAD_API_URL;
const deleteUrl = process.env.DELETE_API_URL;

export async function deleteDriveFile(attachmentId) {
  if (!attachmentId) return false;
  try {
    const res = await fetch(deleteUrl, {
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
    showErrorSection("Error deleting attachment from Drive:", err);
    return false;
  }
}
export async function uploadDriveFile(file, path) {
  if (!file || !path) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

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
    showErrorSection("Error uploading file to Drive:", err);
    return null;
  }
}
