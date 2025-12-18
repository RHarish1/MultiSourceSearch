import express, { Response } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { decrypt } from "../utils/cryptoUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
import { prisma } from "../prisma.js";





dotenv.config({ quiet: true });
const router = express.Router();



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
        
        // Wait for session to be saved before responding
        await req.session.save();

        return res.status(200).json({ message: "Registered successfully", userId: user.id });
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
        const { email, password } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                OR: [ { email: email }],
            },
        });

        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        req.session.userId = user.id;
        
        // Wait for session to be saved before responding
        await req.session.save();
        
        return res.status(200).json({ message: "Logged in", userId: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed"});
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
                dismissedDrivePrompt: true,
                drives:{
                    select: { provider: true },
                }
            },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        return res.json({ 
            id: user.id,
            email: user.email,
            username: user.username,
            connectedDrives: user.drives.map(d => d.provider),
            dismissedDrivePrompt: user.dismissedDrivePrompt,
            isNewUser: false,
        });
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




export default router;
