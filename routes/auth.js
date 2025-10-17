import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../models/postgres/index.js';
const { sequelize, User, Drive } = db;

const router = express.Router();

// --- Register ---
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    req.session.userId = user.id; // login after register
    res.json({ message: 'Registered', userId: user.id });
});

// --- Login ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid username/password' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Invalid username/password' });

    req.session.userId = user.id;
    res.json({ message: 'Logged in', userId: user.id });
});

// --- Logout ---
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

export default router;
