import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";


const router = express.Router();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve dashboard page
router.get("/", (_req: Request, res: Response): void => {
    res.sendFile(path.join(__dirname, "../../public/dashboard.html"));
});

export default router;
