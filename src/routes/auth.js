import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../models/postgres/index.js';
const { User, Drive } = db;
import { Op } from 'sequelize';
import requireLogin from '../middleware/requireLogin.js';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fetch from 'node-fetch';
import { encrypt, decrypt } from '../utils/cryptoUtils.js';
import refreshDrives from '../middleware/refreshDrives.js';
dotenv.config();

const router = express.Router();


// ===================== REGISTER =====================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        });

        if (existingUser)
            return res.status(400).json({ error: existingUser.username === username ? 'Username already taken' : 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, passwordHash });

        req.session.userId = user.id;
        // res.json({ message: 'Registered successfully', userId: user.id });
        res.json({ message: 'Registered successfully', userId: user.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});


// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await User.findOne({
            where: { [Op.or]: [{ username: login }, { email: login }] }
        });

        if (!user || !user.passwordHash)
            return res.status(400).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        req.session.userId = user.id;
        // res.json({ message: 'Logged in', userId: user.id });
        res.json({ message: 'Logged in' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});


// ===================== LOGOUT =====================
router.post('/logout', requireLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});


// ===================== CURRENT USER =====================
router.get('/me', requireLogin, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'email']
        });

        // Check if drives exist
        const drives = await Drive.findAll({
            where: { userId: user.id },
            attributes: ['provider', 'email', 'createdAt']
        });

        const linked = {
            google: drives.some(d => d.provider === 'google'),
            onedrive: drives.some(d => d.provider === 'onedrive')
        };

        res.json({ user, linked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.get('/drives', requireLogin, refreshDrives, async (req, res) => {
    try {
        const drives = await Drive.findAll({ where: { userId: req.session.userId } });

        const decryptedDrives = drives.map(drive => ({
            provider: drive.provider,
            email: drive.email,
            expiry: drive.expiry,
            accessToken: decrypt(drive.accessToken),
            refreshToken: decrypt(drive.refreshToken),
        }));

        res.json({ drives: decryptedDrives });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve drives' });
    }
});


// ======================================================
//                GOOGLE DRIVE OAUTH
// ======================================================
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect to Google Consent Screen
router.get('/google', requireLogin, refreshDrives, (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.file'
        ]
    });
    res.redirect(authUrl);
});

// Step 2: Google OAuth Callback
router.get('/google/callback', requireLogin, refreshDrives, async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const { data } = await oauth2.userinfo.get();

        await Drive.upsert({
            userId: req.session.userId,
            provider: 'google',
            email: data.email,
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        });

        res.redirect('/manageDrives');
    } catch (err) {
        console.error(err);
        res.status(500).send('Google OAuth failed');
    }
});


// ======================================================
//                ONEDRIVE OAUTH
// ======================================================

router.get('/onedrive', requireLogin, refreshDrives, (req, res) => {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.ONEDRIVE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.ONEDRIVE_REDIRECT_URI)}&scope=Files.ReadWrite.All offline_access User.Read`;
    res.redirect(authUrl);
});

router.get('/onedrive/callback', requireLogin, refreshDrives, async (req, res) => {
    try {
        const { code } = req.query;

        // Step 1: Exchange code for tokens
        const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.ONEDRIVE_CLIENT_ID,
                client_secret: process.env.ONEDRIVE_CLIENT_SECRET,
                code,
                redirect_uri: process.env.ONEDRIVE_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const tokens = await tokenRes.json();
        if (!tokens.access_token) {
            throw new Error('Failed to get access token from Microsoft');
        }

        // Step 2: Fetch the user’s email/profile from Microsoft Graph
        const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const user = await userRes.json();
        if (!user || !user.mail) {
            console.warn('No email found in Microsoft Graph user response:', user);
        }

        // Step 3: Store in your database
        await Drive.upsert({
            userId: req.session.userId,
            provider: 'onedrive',
            email: user.mail || user.userPrincipalName || null,
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            expiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
        });

        res.redirect('/manageDrives');
    } catch (err) {
        console.error('OneDrive OAuth failed:', err);
        res.status(500).send('OneDrive OAuth failed');
    }
});


export default router;
