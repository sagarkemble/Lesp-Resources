import { showErrorSection } from "./error.js";

export async function deleteDriveFile(attachmentId) {
  if (!attachmentId) return false;
  try {
    const res = await fetch(
      "https://lesp-resources-api-server.vercel.app/delete",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: attachmentId }),
      },
    );

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
async function ensureFolder(path, accessToken) {
  const parts = path.split("/").filter(Boolean); // split by "/" and remove empty
  let parentId = "root"; // start from root

  for (const name of parts) {
    // 1. Search if folder exists
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const searchData = await searchRes.json();

    let folderId;
    if (searchData.files && searchData.files.length > 0) {
      // Folder exists
      folderId = searchData.files[0].id;
    } else {
      // 2. Create folder
      const createRes = await fetch(
        "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId],
          }),
        },
      );
      const createData = await createRes.json();
      folderId = createData.id;
    }

    parentId = folderId; // go deeper
  }

  return parentId; // ID of the last folder
}
export async function uploadDriveFile(file, path) {
  if (!file || !path) return null;

  try {
    const tokenRes = await fetch(
      "https://lesp-resources-api-server.vercel.app/get-token",
    );
    const { accessToken } = await tokenRes.json();

    if (!accessToken) throw new Error("No access token received");

    const folderId = await ensureFolder(path, accessToken);

    const metadata = {
      name: file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", file);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      },
    );

    const uploadResult = await uploadRes.json();

    if (uploadResult.error) {
      console.error("Drive upload failed:", uploadResult.error);
      return null;
    }

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions?supportsAllDrives=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      },
    );

    return {
      webViewLink: `https://drive.google.com/file/d/${uploadResult.id}/view`,
      fileId: uploadResult.id,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    return null;
  }
}

// direct cloud upload via server old method
// export async function uploadDriveFile(file, path) {
//   if (!file || !path) return null;

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("path", path);

//   try {
//     const response = await fetch("http://localhost:3000/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const result = await response.json();
//     console.log("Drive upload response:", result);

//     if (!result.success) {
//       showErrorSection();

//       console.error("File upload failed:", result.error);
//       return null;
//     }

//     return {
//       webViewLink: result.webViewLink,
//       fileId: result.fileId,
//     };
//   } catch (err) {
//     showErrorSection("Error uploading file to Drive:", err);
//     return null;
//   }
// }
