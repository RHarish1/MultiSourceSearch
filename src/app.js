import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/google.js';
import { requireLogin } from '../middleware/auth.js';
import { db } from '../models/postgres/index.js';
const { sequelize, User, Drive } = db;
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';


const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/auth/google', googleRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/dashboard', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

await sequelize.sync();
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
