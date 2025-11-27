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


router.get("/", requireLogin, refreshDrives, (_req, res) => {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${process.env["DROPBOX_CLIENT_ID"]
        }&response_type=code&token_access_type=offline&redirect_uri=${encodeURIComponent(
            process.env["DROPBOX_REDIRECT_URI"]!
        )}`;

    return res.redirect(authUrl);
});

router.get(
    "/callback",
    requireLogin,
    refreshDrives,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const code = req.query["code"] as string;
            if (!code) return res.status(400).json({ error: "Missing code" });

            // Exchange Authorization Code → Tokens
            const tokenRes = await fetch("https://api.dropboxapi.com/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    code,
                    grant_type: "authorization_code",
                    client_id: process.env["DROPBOX_CLIENT_ID"]!,
                    client_secret: process.env["DROPBOX_CLIENT_SECRET"]!,
                    redirect_uri: process.env["DROPBOX_REDIRECT_URI"]!,
                }),
            });

            const tokens = (await tokenRes.json()) as {
                access_token: string;
                refresh_token?: string;
                expires_in: number;
                token_type: string;
                scope?: string;
                account_id?: string;
                uid?: string;
            };

            if (!tokens.access_token) {
                throw new Error("Failed to get Dropbox access token");
            }

            // Fetch Dropbox User Info
            const userRes = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${tokens.access_token}`,
                    "Content-Type": "application/json",
                },
            });

            const userData = (await userRes.json()) as {
                email?: string;
                account_id?: string;
                name?: { display_name?: string };
            };

            // Upsert into Prisma
            await prisma.drives.upsert({
                where: {
                    userId_provider: {
                        userId: req.session.userId!,
                        provider: "dropbox",
                    },
                },
                update: {
                    email: userData.email ?? null,
                    accessToken: encrypt(tokens.access_token) ?? '',
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? '',
                    expiry: tokens.expires_in
                        ? new Date(Date.now() + tokens.expires_in * 1000)
                        : null,
                },
                create: {
                    userId: req.session.userId!,
                    provider: "dropbox",
                    email: userData.email ?? null,
                    accessToken: encrypt(tokens.access_token) ?? " ",
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? " ",
                    expiry: tokens.expires_in
                        ? new Date(Date.now() + tokens.expires_in * 1000)
                        : null,
                },
            });

            return res.redirect(`${FRONTEND_URL}/dashboard`);
        } catch (err) {
            console.error("Dropbox OAuth failed:", err);
            return res.redirect(`${FRONTEND_URL}/manageDrives?error=dropbox_oauth_failed`);
        }
    }
);


export default router;