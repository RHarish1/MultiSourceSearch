import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../../models/postgres/index.js';
const { sequelize, User, Drive } = db;

const router = express.Router();

// --- Passport Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const userId = req.userIdForGoogle;
        if (!userId) return done(new Error('User not logged in'));

        const [drive, created] = await Drive.findOrCreate({
            where: { provider: 'google', UserId: userId },
            defaults: { accessToken, refreshToken }
        });

        if (!created) {
            drive.accessToken = accessToken;
            drive.refreshToken = refreshToken;
            await drive.save();
        }

        done(null, drive);
    } catch (err) {
        done(err);
    }
}));


passport.serializeUser((obj, done) => done(null, obj.id));
passport.deserializeUser(async (id, done) => {
    const drive = await Drive.findByPk(id);
    done(null, drive);
});

// --- Routes ---
router.get('/', (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
        state: JSON.stringify({ userId: req.session.userId })
    })(req, res, next);
});
router.get(
    '/callback',
    (req, res, next) => {
        const state = JSON.parse(req.query.state || '{}');
        req.userIdForGoogle = state.userId;;
        next();
    },
    passport.authenticate('google', {
        failureRedirect: '/',
        successRedirect: '/dashboard'
    })
);


export default router;
