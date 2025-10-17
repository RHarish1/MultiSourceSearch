import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../models/postgres/index.js';
const { sequelize, User, Drive } = db;
import { Op } from 'sequelize';

const router = express.Router();

// --- Register ---
// POST /auth/register
// Body: { username, email, password }
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if username or email already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            } else {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({ username, email, passwordHash });

        req.session.userId = user.id;

        res.json({ message: 'Registered', userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// --- Login ---
// POST /auth/login
// Body: { login, password }  // login can be username or email
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        // Find user by username OR email
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: login },
                    { email: login }
                ]
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid username/email or password' });

        // Check if user has a password
        if (!user.passwordHash) {
            return res.status(400).json({ error: 'This user cannot log in with password' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ error: 'Invalid username/email or password' });

        req.session.userId = user.id;
        res.json({ message: 'Logged in', userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- Logout ---
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});

// --- Get current logged-in user ---
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'email']
        });
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
