import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID =
  "172156645696-ukp2qshuv5rl0klbi6v7ed6bk3o9827g.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04jME_1LJQS2rCgYIARAAGAQSNwF-L9IrJgRHYbK82_ymqShF5kF4dPT71vBTY_RcnvmJU_yn0IXiuC-utAA0axcEWDdTRGchdX8";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const filePath = path.join(__dirname, "Unit 3.pdf");

async function uploadFile() {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "sample.pdf",
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
      },
    });
    console.log("File uploaded:", response.data);
  } catch (e) {
    console.error("Upload failed:", e.message);
  }
}

createPublicUrl();
// uploadFile();
// deleteFile();
async function deleteFile() {
  try {
    const response = await drive.files.delete({
      fileId: "1ETuMMmqF_zyUV0myxe8zoSIMiPbBu2hs",
    });
    console.log(response.data, response.status);
  } catch (error) {
    console.log(error.message);
  }
}
async function createPublicUrl() {
  try {
    await drive.permissions.create({
      fileId: "1YT598I9_Q_42Q4RS66In4DMIInlmQk-w",
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const response = await drive.files.get({
      fileId: "1YT598I9_Q_42Q4RS66In4DMIInlmQk-w",
      fields: "webViewLink,webContentLink",
    });
    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
}
