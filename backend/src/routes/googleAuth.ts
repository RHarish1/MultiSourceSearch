import express, { Response } from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import { encrypt } from "../utils/cryptoUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
import { prisma } from "../prisma.js";


dotenv.config({ quiet: true });
const router = express.Router();

const FRONTEND_URL = process.env["FRONTEND_URL"];


const oauth2Client = new google.auth.OAuth2(
    process.env["GOOGLE_CLIENT_ID"],
    process.env["GOOGLE_CLIENT_SECRET"],
    process.env["GOOGLE_REDIRECT_URI"]
);

console.log("🔧 Google OAuth Configuration:");
console.log("  Client ID:", process.env["GOOGLE_CLIENT_ID"]);
console.log("  Redirect URI:", process.env["GOOGLE_REDIRECT_URI"]);

router.get("/", requireLogin, refreshDrives, (_req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });
    console.log("🔗 Generated OAuth URL:", authUrl);
    return res.redirect(authUrl);
});

router.get(
    "/callback",
    requireLogin,
    refreshDrives,
    async (_req: AuthenticatedRequest, res: Response) => {
        try {
            const code = _req.query["code"] as string;
            if (!code) {
                return res.status(400).json({ error: "Missing code" });
            }


            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
            const { data } = await oauth2.userinfo.get();

            await prisma.drives.upsert({
                where: {
                    userId_provider: {
                        userId: _req.session.userId!,
                        provider: "google",
                    },
                },
                update: {
                    accessToken: encrypt(tokens.access_token ?? "") ?? "",
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? "",
                    expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    email: data.email ?? null,
                },
                create: {
                    userId: _req.session.userId!,
                    provider: "google",
                    email: data.email ?? null,
                    accessToken: encrypt(tokens.access_token ?? "") ?? "",
                    refreshToken: encrypt(tokens.refresh_token ?? "") ?? "",
                    expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                },
            });

            return res.redirect(`${FRONTEND_URL}/dashboard`);
        } catch (err) {
            console.error(err);
            return res.redirect(`${FRONTEND_URL}/manageDrives?error=google_oauth_failed`);
        }
    }
);

export default router;