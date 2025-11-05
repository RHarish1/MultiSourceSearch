// utils/driveUtils.js
import { google } from 'googleapis';
import fetch from 'node-fetch';
import { decrypt, encrypt } from './cryptoUtils.js';
import { Drive } from '../models/postgres/Drive.js';
import refreshDrives from '../middleware/refreshDrives.js';
import { Readable } from 'stream';

// Auto-refresh before actions
async function ensureFreshDrive(userId, provider) {
    await refreshDrives({ session: { userId } }, { locals: {} }, () => { });
    return await Drive.findOne({ where: { userId, provider } });
}

// ---------- UPLOAD ----------
export async function uploadToDrive(userId, provider, file) {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive) throw new Error(`${provider} drive not linked`);

    const accessToken = decrypt(drive.accessToken);

    if (provider === 'google') {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        const res = await driveClient.files.create({
            requestBody: { name: file.originalname, mimeType: file.mimetype },
            media: { mimeType: file.mimetype, body: bufferStream },
            fields: 'id, webViewLink, thumbnailLink'
        });

        return {
            id: res.data.id,
            url: res.data.webViewLink,
            thumbnail: res.data.thumbnailLink
        };
    }

    if (provider === 'onedrive') {
        const uploadRes = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/Uploads/${file.originalname}:/content`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': file.mimetype
            },
            body: file.buffer
        });

        const data = await uploadRes.json();
        return {
            id: data.id,
            url: data.webUrl
        };
    }

    throw new Error('Unknown provider');
}

// ---------- DELETE ----------
export async function deleteFromDrive(userId, provider, fileId) {
    const drive = await ensureFreshDrive(userId, provider);
    if (!drive) throw new Error(`${provider} drive not linked`);

    const accessToken = decrypt(drive.accessToken);

    if (provider === 'google') {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        await driveClient.files.delete({ fileId });
        return true;
    }

    if (provider === 'onedrive') {
        await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return true;
    }

    throw new Error('Unknown provider');
}
