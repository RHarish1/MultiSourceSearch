import fetch from "node-fetch";
import { Drive } from "../models/postgres/Drive.js";
import { decrypt, encrypt } from "../utils/cryptoUtils.js";
import type { Request, Response, NextFunction } from "express";

// ----------------------------------------
// Helper: Refresh Google Drive token
// ----------------------------------------
async function refreshGoogleToken(drive: Drive): Promise<void> {
    const refreshToken = decrypt(drive.refreshToken);
    if (!refreshToken) throw new Error("No Google refresh token");

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
    const tokens = (await res.json()) as {
        access_token: string;
        expires_in?: number;
    };

    await drive.update({
        accessToken: (tokens.access_token ? encrypt(tokens.access_token) : drive.accessToken) as string,
        expiry: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : drive.expiry,
    });
}

// ----------------------------------------
// Helper: Refresh OneDrive token
// ----------------------------------------
async function refreshOneDriveToken(drive: Drive): Promise<void> {
    const refreshToken = decrypt(drive.refreshToken);
    if (!refreshToken) throw new Error("No OneDrive refresh token");

    const res = await fetch(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.ONEDRIVE_CLIENT_ID!,
                client_secret: process.env.ONEDRIVE_CLIENT_SECRET!,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
                redirect_uri: process.env.ONEDRIVE_REDIRECT_URI!,
            }),
        }
    );

    if (!res.ok) throw new Error(`OneDrive token refresh failed: ${res.status}`);
    const tokens = (await res.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    };

    await drive.update({
        refreshToken: (tokens.refresh_token
            ? encrypt(tokens.refresh_token)
            : drive.refreshToken) as string,
        expiry: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : drive.expiry,
    });
}

// ----------------------------------------
// Middleware: Refresh drives if expired
// ----------------------------------------
export default async function refreshDrives(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req.session as any)?.userId as string | undefined;
        if (!userId) return next();

        const drives = await Drive.findAll({ where: { userId } });

        for (const drive of drives) {
            const now = new Date();
            const isExpired = drive.expiry && now > drive.expiry;

            if (!isExpired) continue;

            try {
                if (drive.provider === "google") {
                    await refreshGoogleToken(drive);
                    console.log(`✅ Refreshed Google token for ${drive.email ?? userId}`);
                } else if (drive.provider === "onedrive") {
                    await refreshOneDriveToken(drive);
                    console.log(`✅ Refreshed OneDrive token for ${drive.email ?? userId}`);
                }
            } catch (err) {
                const e = err as Error;
                console.warn(
                    `⚠️ Failed to refresh ${drive.provider} token for ${drive.email || userId
                    }: ${e.message}`
                );
                await drive.destroy();
                console.log(`🗑️ Deleted expired ${drive.provider} for ${drive.email || userId}`);
            }
        }

        next();
    } catch (err) {
        console.error("[refreshDrives] Middleware error:", err);
        next();
    }
}
