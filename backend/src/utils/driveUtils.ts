import { google } from "googleapis";
import fetch from "node-fetch";
import { Readable } from "stream";
import { decrypt } from "./cryptoUtils.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { prisma } from "../prisma.js";
import type { drives } from "@prisma/client";

// -----------------------------
// Helper: Auto-refresh Drive tokens
// -----------------------------
async function ensureFreshDrive(
    userId: string,
    provider: "google" | "onedrive"
): Promise<drives | null> {
    // Manually call refresh middleware (fake req/res)
    await refreshDrives(
        { session: { userId } } as any,
        { locals: {} } as any,
        () => { }
    );

    return await prisma.drives.findFirst({
        where: { userId, provider },
    });
}

// -----------------------------
// UPLOAD FILE TO CLOUD DRIVE
// -----------------------------
export async function uploadToDrive(
    userId: string,
    provider: "google" | "onedrive",
    file: Express.Multer.File
): Promise<{ id: string; url: string; thumbnail?: string }> {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive) throw new Error(`${provider} drive not linked`);

    const accessToken = decrypt(drive.accessToken);

    // ---------- Google Drive ----------
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
        console.log(`[GOOGLE UPLOAD RESPONSE]`, JSON.stringify(res.data, null, 2));
        const result: { id: string; url: string; thumbnail?: string } = {
            id: res.data.id ?? "",
            url: res.data.webViewLink ?? "",
        };

        if (res.data.thumbnailLink) result.thumbnail = res.data.thumbnailLink;

        return result;
    }

    // ---------- OneDrive ----------
    if (provider === "onedrive") {
        const uploadRes = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/root:/Uploads/${encodeURIComponent(
                file.originalname
            )}:/content`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": file.mimetype,
                },
                body: file.buffer,
            }
        );

        if (!uploadRes.ok)
            throw new Error(`OneDrive upload failed: ${uploadRes.statusText}`);

        const data = (await uploadRes.json()) as { id: string; webUrl: string };
        return { id: data.id, url: data.webUrl };
    }

    throw new Error("Unknown provider");
}

// -----------------------------
// GET THUMBNAIL FOR FILE
// -----------------------------
export async function getThumbnail(
    userId: string,
    provider: "google" | "onedrive",
    fileId: string
): Promise<string | null> {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive) throw new Error(`${provider} drive not linked`);

    const accessToken = decrypt(drive.accessToken);

    // ---------- Google Drive ----------
    if (provider === "google") {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: "v3", auth: oauth2Client });

        try {
            const res = await driveClient.files.get({
                fileId,
                fields: "thumbnailLink",
            });

            return res.data.thumbnailLink || null;
        } catch (error) {
            console.error("Error fetching thumbnail:", error);
            return null;
        }
    }

    // ---------- OneDrive ----------
    if (provider === "onedrive") {
        // OneDrive doesn't provide direct thumbnails easily
        return null;
    }

    return null;
}

// -----------------------------
// DELETE FILE FROM DRIVE
// -----------------------------
export async function deleteFromDrive(
    userId: string,
    provider: "google" | "onedrive",
    fileId: string
): Promise<boolean> {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive) throw new Error(`${provider} drive not linked`);

    const accessToken = decrypt(drive.accessToken);

    // ---------- Google Drive ----------
    if (provider === "google") {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: "v3", auth: oauth2Client });
        await driveClient.files.delete({ fileId });
        return true;
    }

    // ---------- OneDrive ----------
    if (provider === "onedrive") {
        const delRes = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!delRes.ok)
            throw new Error(`OneDrive delete failed: ${delRes.statusText}`);

        return true;
    }

    throw new Error("Unknown provider");
}
