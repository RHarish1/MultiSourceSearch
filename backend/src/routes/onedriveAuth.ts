import express, { Response } from "express";
import dotenv from "dotenv";
import { encrypt } from "../utils/cryptoUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
import { prisma } from "../prisma.js";


dotenv.config({ quiet: true });
const router = express.Router();

const FRONTEND_URL = process.env["FRONTEND_URL"];


// ======================================================
// INTERFACES
// ======================================================
interface MicrosoftTokenResponse {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in?: number;
    access_token: string;
    refresh_token?: string;
    id_token?: string;
}

interface MicrosoftGraphUser {
    mail?: string;
    userPrincipalName?: string;
}

// ======================================================
// ONEDRIVE OAUTH
// ======================================================
router.get("/", requireLogin, refreshDrives, (_req, res) => {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env["ONEDRIVE_CLIENT_ID"]}&response_type=code&redirect_uri=${encodeURIComponent(
        process.env["ONEDRIVE_REDIRECT_URI"]!
    )}&scope=Files.ReadWrite.All offline_access User.Read`;
    return res.redirect(authUrl);
});

router.get(
    "/callback",
    requireLogin,
    refreshDrives,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const code = req.query["code"] as string;
            if (!code) {
                return res.status(400).json({ error: "Missing code" });
            }


            const tokenRes = await fetch(
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: process.env["ONEDRIVE_CLIENT_ID"]!,
                        client_secret: process.env["ONEDRIVE_CLIENT_SECRET"]!,
                        code,
                        redirect_uri: process.env["ONEDRIVE_REDIRECT_URI"]!,
                        grant_type: "authorization_code",
                    }),
                }
            );

            const tokens = (await tokenRes.json()) as MicrosoftTokenResponse;
            if (!tokens.access_token) {
                throw new Error("Failed to get access token from Microsoft");
            }

            const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            const userData = (await userRes.json()) as MicrosoftGraphUser;

            await prisma.drives.upsert({
                where: {
                    userId_provider: {
                        userId: req.session.userId!,
                        provider: "onedrive",
                    },
                },
                update: {
                    email: userData.mail ?? userData.userPrincipalName ?? null,
                    accessToken: encrypt(tokens.access_token) ?? "",
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? "",
                    expiry: tokens.expires_in
                        ? new Date(Date.now() + tokens.expires_in * 1000)
                        : null,
                },
                create: {
                    userId: req.session.userId!,
                    provider: "onedrive",
                    email: userData.mail ?? userData.userPrincipalName ?? null,
                    accessToken: encrypt(tokens.access_token) ?? "",
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? "",
                    expiry: tokens.expires_in
                        ? new Date(Date.now() + tokens.expires_in * 1000)
                        : null,
                },
            });

            return res.redirect(`${FRONTEND_URL}/dashboard`);
        } catch (err) {
            console.error("OneDrive OAuth failed:", err);
            return res.redirect(`${FRONTEND_URL}/manageDrives?error=onedrive_oauth_failed`);

        }
    }
);

export default router;