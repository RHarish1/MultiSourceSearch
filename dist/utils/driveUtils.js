import { google } from "googleapis";
import fetch from "node-fetch";
import { Readable } from "stream";
import { decrypt } from "./cryptoUtils.js";
import { Drive } from "../models/postgres/Drive.js";
import refreshDrives from "../middleware/refreshDrives.js";
// -----------------------------
// Helper: Auto-refresh Drive tokens
// -----------------------------
async function ensureFreshDrive(userId, provider) {
    // Call refresh middleware manually with fake req/res
    await refreshDrives({ session: { userId } }, { locals: {} }, () => { });
    return await Drive.findOne({ where: { userId, provider } });
}
// -----------------------------
// UPLOAD FILE TO CLOUD DRIVE
// -----------------------------
export async function uploadToDrive(userId, provider, file) {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive)
        throw new Error(`${provider} drive not linked`);
    const accessToken = decrypt(drive.accessToken);
    // ---------------- Google Drive Upload ----------------
    if (provider === "google") {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: "v3", auth: oauth2Client });
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        const res = await driveClient.files.create({
            requestBody: { name: file.originalname, mimeType: file.mimetype },
            media: { mimeType: file.mimetype, body: bufferStream },
            fields: "id, webViewLink, thumbnailLink",
        });
        const result = {
            id: res.data.id ?? "",
            url: res.data.webViewLink ?? "",
        };
        if (res.data.thumbnailLink) {
            result.thumbnail = res.data.thumbnailLink;
        }
        return result;
    }
    // ---------------- OneDrive Upload ----------------
    if (provider === "onedrive") {
        const uploadRes = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/Uploads/${encodeURIComponent(file.originalname)}:/content`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": file.mimetype,
            },
            body: file.buffer,
        });
        if (!uploadRes.ok) {
            throw new Error(`OneDrive upload failed: ${uploadRes.statusText}`);
        }
        const data = (await uploadRes.json());
        return { id: data.id, url: data.webUrl };
    }
    throw new Error("Unknown provider");
}
// -----------------------------
// DELETE FILE FROM DRIVE
// -----------------------------
export async function deleteFromDrive(userId, provider, fileId) {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive)
        throw new Error(`${provider} drive not linked`);
    const accessToken = decrypt(drive.accessToken);
    // ---------------- Google Drive Delete ----------------
    if (provider === "google") {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: "v3", auth: oauth2Client });
        await driveClient.files.delete({ fileId });
        return true;
    }
    // ---------------- OneDrive Delete ----------------
    if (provider === "onedrive") {
        const delRes = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!delRes.ok) {
            throw new Error(`OneDrive delete failed: ${delRes.statusText}`);
        }
        return true;
    }
    throw new Error("Unknown provider");
}
//# sourceMappingURL=driveUtils.js.map