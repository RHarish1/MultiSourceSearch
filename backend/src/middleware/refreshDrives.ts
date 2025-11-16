import fetch from "node-fetch";
import type { drives, Prisma } from "@prisma/client";
import { decrypt, encrypt } from "../utils/cryptoUtils.js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

// ----------------------------------------
// Helper: Refresh Google Drive token
// ----------------------------------------
async function refreshGoogleToken(drive: drives): Promise<void> {
    const refreshToken = decrypt(drive.refreshToken);
    if (!refreshToken) throw new Error("No Google refresh token");

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env["GOOGLE_CLIENT_ID"]!,
            client_secret: process.env["GOOGLE_CLIENT_SECRET"]!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
    const tokens = (await res.json()) as {
        access_token: string;
        expires_in?: number;
    };

    await prisma.drives.update({
        where: { id: drive.id },
        data: {
            accessToken: (tokens.access_token
                ? encrypt(tokens.access_token)
                : drive.accessToken ?? "") as string,
            expiry: tokens.expires_in
                ? new Date(Date.now() + tokens.expires_in * 1000)
                : drive.expiry,
        },
    });

}

// ----------------------------------------
// Helper: Refresh OneDrive token
// ----------------------------------------
async function refreshOneDriveToken(drive: drives): Promise<void> {
    const refreshToken = decrypt(drive.refreshToken);
    if (!refreshToken) throw new Error("No OneDrive refresh token");

    const res = await fetch(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env["ONEDRIVE_CLIENT_ID"]!,
                client_secret: process.env["ONEDRIVE_CLIENT_SECRET"]!,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
                redirect_uri: process.env["ONEDRIVE_REDIRECT_URI"]!,
            }),
        }
    );

    if (!res.ok) throw new Error(`OneDrive token refresh failed: ${res.status}`);
    const tokens = (await res.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    };

    await prisma.drives.update({
        where: { id: drive.id },
        data: {
            ...(tokens.refresh_token && {
                refreshToken: encrypt(tokens.refresh_token),
            }),
            ...(tokens.expires_in && {
                expiry: new Date(Date.now() + tokens.expires_in * 1000),
            }),
        } as Prisma.drivesUpdateInput,
    });

}

// ----------------------------------------
// Middleware: Refresh drives if expired
// ----------------------------------------
export default async function refreshDrives(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req.session as any)?.userId as string | undefined;
        if (!userId) return next();

        const drives = await prisma.drives.findMany({ where: { userId } });

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
                await prisma.drives.delete({
                    where: { id: drive.id },
                });
                console.log(`🗑️ Deleted expired ${drive.provider} for ${drive.email || userId}`);
            }
        }

        next();
    } catch (err) {
        console.error("[refreshDrives] Middleware error:", err);
        next();
    }
}
