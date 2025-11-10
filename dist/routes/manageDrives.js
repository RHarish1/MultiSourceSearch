import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const router = express.Router();
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve dashboard page
router.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../public/manageDrives.html"));
});
export default router;
//# sourceMappingURL=manageDrives.js.map