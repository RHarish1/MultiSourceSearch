import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/google.js';
import { db } from './models/postgres/index.js';
const { sequelize, User, Drive } = db;

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

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

app.get('/', (req, res) => res.send('Home'));

await sequelize.sync();
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
