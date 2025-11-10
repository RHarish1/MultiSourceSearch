import express, { Response, NextFunction } from "express";
import multer from "multer";
import { Op } from "sequelize";
import { db } from "../models/postgres/index.js";
import { uploadToDrive, deleteFromDrive } from "../utils/driveUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const { Image, Tag, ImageTag, Drive } = db;

// ======================================================
//                  GET IMAGES
// ======================================================
router.get(
    "/",
    requireLogin,
    refreshDrives,
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        try {
            const userId = req.session.userId ?? " ";
            const search = (req.query["search"] as string | undefined)?.trim();

            const where: any = { userId };
            if (search) {
                where.fileName = { [Op.iLike]: `%${search}%` };
            }

            const images = await Image.findAll({
                where,
                include: [{ model: Tag, as: "tags", through: { attributes: [] } }],
                order: [["createdAt", "DESC"]],
            });

            const result = images.map((img: any) => ({
                id: img.id,
                fileName: img.fileName,
                fileUrl: img.fileUrl,
                tags: img.Tags?.map((t: any) => t.name) || [],
            }));

            res.json(result);
        } catch (err) {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    }
);

// ======================================================
//                  SEARCH IMAGES
// ======================================================
router.get(
    "/search",
    requireLogin,
    async (_req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = _req.session.userId;
            const q = ((_req.query["q"] as string) || "").trim();
            const and = _req.query["and"] === "true";
            if (!userId) return res.status(401).json({ error: "Not logged in" });
            if (!q) return res.status(400).json({ error: "Missing query" });

            const tokens = q.split(/[, ]+/).filter(Boolean);

            const fileNameConditions = tokens.map((t) => ({
                fileName: { [Op.iLike]: `%${t}%` },
            }));

            const tagConditions = tokens.map((t) => ({
                "$tags.name$": { [Op.iLike]: `%${t}%` },
            }));

            const whereClause = {
                [Op.and]: [
                    { userId },
                    and
                        ? { [Op.and]: [...fileNameConditions, ...tagConditions] }
                        : { [Op.or]: [...fileNameConditions, ...tagConditions] },
                ],
            };

            const images = await Image.findAll({
                where: whereClause,
                include: [
                    {
                        model: Tag,
                        through: { attributes: [] },
                        as: "tags",
                        attributes: ["name"],
                    },
                ]
            });

            const result = images.map((img: any) => ({
                id: img.id,
                fileName: img.fileName,
                fileUrl: img.fileUrl,
                tags: img.Tags?.map((t: any) => t.name) || [],
            }));

            res.json({ images: result });
        } catch (err) {
            console.error("Search error:", err);
            res.status(500).json({ error: "Search failed" });
        }
        return;
    }
);

// ======================================================
//                  UPLOAD IMAGE
// ======================================================
router.post(
    "/upload",
    requireLogin,
    upload.single("file"),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.session.userId;
            const { tags, fileName } = req.body;
            const providerRaw = req.body.provider;

            // narrow and validate provider type
            const isProvider = (p: any): p is "google" | "onedrive" =>
                p === "google" || p === "onedrive";

            if (!isProvider(providerRaw)) {
                return res.status(400).json({ error: "Invalid or missing provider" });
            }
            const provider = providerRaw;

            if (!req.file)
                return res.status(400).json({ error: "No file uploaded." });

            const drive = await Drive.findOne({ where: { userId, provider } });
            if (!drive) return res.status(400).json({ error: "Drive not linked." });

            const uploaded = await uploadToDrive(userId ?? " ", provider, req.file);

            const image = await Image.create({
                userId: userId ?? " ",
                driveId: drive.id,
                provider,
                fileId: uploaded.id,
                fileName: fileName || req.file.originalname,
                fileUrl: uploaded.url,
                uploadedAt: new Date(),
            });

            const tagNames = tags
                ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];

            for (const name of tagNames) {
                const [tag] = await Tag.findOrCreate({ where: { name } });
                await ImageTag.create({ imageId: image.id, tagId: tag.id });
            }

            res.json({ success: true, imageId: image.id });
        } catch (err) {
            console.error("Error uploading image:", err);
            res.status(500).json({ error: "Upload failed" });
        }
        return;
    }
);

// ======================================================
//                  EDIT IMAGE
// ======================================================
router.put(
    "/:id",
    requireLogin,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.session.userId;
            const { fileName, tags } = req.body;

            const image = await Image.findOne({ where: { id: req.params["id"], userId } });
            if (!image) return res.status(404).json({ error: "Not found" });

            if (fileName) image.fileName = fileName;
            await image.save();

            await ImageTag.destroy({ where: { imageId: image.id } });

            const tagNames = tags
                ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];

            for (const name of tagNames) {
                const [tag] = await Tag.findOrCreate({ where: { name } });
                await ImageTag.create({ imageId: image.id, tagId: tag.id });
            }

            res.json({ success: true });
        } catch (err) {
            console.error("Error editing image:", err);
            res.status(500).json({ error: "Edit failed" });
        }
        return;
    }
);

// ======================================================
//                  DELETE IMAGE
// ======================================================
router.delete(
    "/:id",
    requireLogin,
    async (_req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = _req.session.userId;
            const image = await Image.findOne({ where: { id: _req.params["id"], userId } });
            if (!image) return res.status(404).json({ error: "Not found" });

            const drive = await Drive.findByPk(image.driveId);
            if (drive) {
                try {
                    if (image.provider === "google" || image.provider === "onedrive") {
                        await deleteFromDrive(userId ?? " ", image.provider, image.fileId);
                    } else {
                        console.warn("Unknown provider, skipping drive delete:", image.provider);
                    }
                } catch (driveErr) {
                    console.warn("Drive delete failed:", driveErr);
                }
            }

            await ImageTag.destroy({ where: { imageId: image.id } });
            await image.destroy();

            res.json({ success: true });
        } catch (err) {
            console.error("Error deleting image:", err);
            res.status(500).json({ error: "Delete failed" });
        }
        return;
    }
);

export default router;
