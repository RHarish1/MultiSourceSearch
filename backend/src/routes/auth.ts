import express, { Response } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { google } from "googleapis";
import { encrypt, decrypt } from "../utils/cryptoUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
import { prisma } from "../prisma.js";


dotenv.config({ quiet: true });
const router = express.Router();

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
// REGISTER
// ======================================================
router.post("/register", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                error:
                    existingUser.username === username
                        ? "Username already taken"
                        : "Email already in use",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { username, email, passwordHash },
        });

        req.session.userId = user.id;
        await req.session.save();

        return res.json({ message: "Registered successfully", userId: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Registration failed" });
    }
});

// ======================================================
// LOGIN
// ======================================================
router.post("/login", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { login, password } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                OR: [{ username: login }, { email: login }],
            },
        });

        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        req.session.userId = user.id;
        await req.session.save();

        return res.json({ message: "Logged in", userId: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed" });
    }
});

// ======================================================
// LOGOUT
// ======================================================
router.post("/logout", requireLogin, (req: AuthenticatedRequest, res: Response) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out" });
    });
});

// ======================================================
// CURRENT USER
// ======================================================
router.get("/me", requireLogin, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: req.session.userId! },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const drives = await prisma.drives.findMany({
            where: { userId: user.id },
            select: { provider: true, email: true, createdAt: true },
        });

        const linked = {
            google: drives.some((d) => d.provider === "google"),
            onedrive: drives.some((d) => d.provider === "onedrive"),
        };

        return res.json({ user, linked });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch user" });
    }
});

// ======================================================
// LIST DRIVES
// ======================================================
router.get(
    "/drives",
    requireLogin,
    refreshDrives,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const drives = await prisma.drives.findMany({
                where: { userId: req.session.userId! },
            });

            const decryptedDrives = drives.map((drive) => ({
                provider: drive.provider,
                email: drive.email,
                expiry: drive.expiry,
                accessToken: decrypt(drive.accessToken),
                refreshToken: decrypt(drive.refreshToken),
            }));

            res.json({ drives: decryptedDrives });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to retrieve drives" });
        }
    }
);

// ======================================================
// GOOGLE DRIVE OAUTH
// ======================================================
const oauth2Client = new google.auth.OAuth2(
    process.env["GOOGLE_CLIENT_ID"],
    process.env["GOOGLE_CLIENT_SECRET"],
    process.env["GOOGLE_REDIRECT_URI"]
);

router.get("/google", requireLogin, refreshDrives, (_req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });
    return res.json({ authUrl });
});

router.get(
    "/google/callback",
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

            return res.status(200).json({ message: "Google OAuth successful" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Google OAuth failed" });
        }
    }
);

// ======================================================
// ONEDRIVE OAUTH
// ======================================================
router.get("/onedrive", requireLogin, refreshDrives, (_req, res) => {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env["ONEDRIVE_CLIENT_ID"]}&response_type=code&redirect_uri=${encodeURIComponent(
        process.env["ONEDRIVE_REDIRECT_URI"]!
    )}&scope=Files.ReadWrite.All offline_access User.Read`;
    return res.json({ authUrl });
});

router.get(
    "/onedrive/callback",
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

            return res.status(200).json({ message: "OneDrive OAuth successful" });
        } catch (err) {
            console.error("OneDrive OAuth failed:", err);
            return res.status(500).json({ error: "OneDrive OAuth failed" });
        }
    }
);

export default router;
