import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
    const { typedUsername, typedPassword } = req.body;
    const user = await User.findOne({
        where: {
            username: typedUsername
        }
    });
    if (!user) {
        return res.status(401).send("Retry Please!");
    }
    const match = await bcrypt.compare(typedPassword, user.password);
    if (match) {
        res.redirect("/home");
    }
    else {
        return res.status(401).send("Retry Please!");
    }
})

// POST /auth/signup
router.post("/signup", async (req, res) => {
    const { typedUsername, typedPassword } = req.body;
    const user = await User.findOne({
        where: {
            username: typedUsername
        }
    });
    if (user) {
        return res.status(401).send("User already exists!");
    }
    const hashedPassword = await bcrypt.hash(typedPassword, 12);
    const newUser = await User.create({ username: typedUsername, password: hashedPassword });
    res.redirect("/home");
})

export default router;