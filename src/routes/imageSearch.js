import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from '../models/postgres/index.js';
const { sequelize, User, Drive } = db;
import { Op } from 'sequelize';

const router = express.Router();
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve dashboard page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/imageSearch.html"));
});

export default router;