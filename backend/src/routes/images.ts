import express, { Response, NextFunction } from "express";
import multer from "multer";
import { prisma } from "../prisma.js";
import { uploadToDrive, deleteFromDrive } from "../utils/driveUtils.js";
import requireLogin from "../middleware/requireLogin.js";
import refreshDrives from "../middleware/refreshDrives.js";
import { AuthenticatedRequest } from "../types/CustomRequest.js";
import { Prisma } from "@prisma/client";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ======================================================
//                  GET IMAGES
// ======================================================
router.get(
    "/",
    requireLogin,
    refreshDrives,
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
        try {
            const userId = req.session.userId!;
            const search = (req.query["search"] as string | undefined)?.trim();

            const where: any = { userId };
            if (search) {
                where.fileName = { contains: search, mode: "insensitive" };
            }

            const images = await prisma.images.findMany({
                where,
                include: {
                    image_tags: {
                        include: { tags: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            const result = images.map((img) => ({
                id: img.id,
                fileName: img.fileName,
                fileUrl: img.fileUrl,
                tags: img.image_tags.map((t) => t.tags.name),
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
router.get("/search", requireLogin, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const q = (req.query["q"] as string)?.trim() ?? "";
        const and = req.query["and"] === "true";

        if (!q) return res.status(400).json({ error: "Missing query" });

        const tokens = q.split(/[, ]+/).filter(Boolean);


        const whereClause: Prisma.imagesWhereInput = {
            userId,
            ...(and
                ? {
                    AND: tokens.map(
                        (t): Prisma.imagesWhereInput => ({
                            OR: [
                                { fileName: { contains: t, mode: "insensitive" } },
                                {
                                    image_tags: {
                                        some: {
                                            tags: { name: { contains: t, mode: "insensitive" } },
                                        },
                                    },
                                },
                            ],
                        })
                    ),
                }
                : {
                    OR: tokens.flatMap(
                        (t): Prisma.imagesWhereInput[] => [
                            { fileName: { contains: t, mode: "insensitive" } },
                            {
                                image_tags: {
                                    some: {
                                        tags: { name: { contains: t, mode: "insensitive" } },
                                    },
                                },
                            },
                        ]
                    ),
                }),
        };

        const images = await prisma.images.findMany({
            where: whereClause,
            include: {
                image_tags: { include: { tags: { select: { name: true } } } },
            },
        });

        const result = images.map((img) => ({
            id: img.id,
            fileName: img.fileName,
            fileUrl: img.fileUrl,
            tags: img.image_tags.map((t) => t.tags.name),
        }));

        return res.json({ images: result });
    } catch (err) {
        console.error("Search error:", err);
        return res.status(500).json({ error: "Search failed" });
    }
});

// ======================================================
//                  UPLOAD IMAGE
// ======================================================
router.post(
    "/upload",
    requireLogin,
    upload.single("file"),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.session.userId!;
            const { tags, fileName } = req.body;
            const providerRaw = req.body.provider;

            const isProvider = (p: any): p is "google" | "onedrive" =>
                p === "google" || p === "onedrive";

            if (!isProvider(providerRaw)) {
                return res.status(400).json({ error: "Invalid or missing provider" });
            }
            const provider = providerRaw;

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded." });
            }

            const drive = await prisma.drives.findFirst({
                where: { userId, provider },
            });
            if (!drive) return res.status(400).json({ error: "Drive not linked." });

            const uploaded = await uploadToDrive(userId, provider, req.file);

            const image = await prisma.images.create({
                data: {
                    userId,
                    driveId: drive.id,
                    provider,
                    fileId: uploaded.id,
                    fileName: fileName || req.file.originalname,
                    fileUrl: uploaded.url,
                    uploadedAt: new Date(),
                },
            });

            const tagNames = tags
                ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];

            for (const name of tagNames) {
                const tag = await prisma.tags.upsert({
                    where: { name },
                    update: {},
                    create: { name, userId },
                });

                await prisma.image_tags.create({
                    data: { imageId: image.id, tagId: tag.id },
                });
            }

            return res.json({ success: true, imageId: image.id });
        } catch (err) {
            console.error("Error uploading image:", err);
            return res.status(500).json({ error: "Upload failed" });
        }
    }
);

// ======================================================
//                  EDIT IMAGE
// ======================================================
router.put("/:id", requireLogin, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { fileName, tags } = req.body;
        const id = req.params["id"];
        if (!id) {
            return res.status(400).json({ error: "Missing image id" });
        }
        const image = await prisma.images.findFirst({
            where: { id, userId },
        });
        if (!image) return res.status(404).json({ error: "Not found" });

        if (fileName) {
            await prisma.images.update({
                where: { id: image.id },
                data: { fileName },
            });
        }

        await prisma.image_tags.deleteMany({ where: { imageId: image.id } });

        const tagNames = tags
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        for (const name of tagNames) {
            const tag = await prisma.tags.upsert({
                where: { name },
                update: {},
                create: { name, userId },
            });

            await prisma.image_tags.create({
                data: { imageId: image.id, tagId: tag.id },
            });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error("Error editing image:", err);
        return res.status(500).json({ error: "Edit failed" });
    }
});

// ======================================================
//                  DELETE IMAGE
// ======================================================
router.delete("/:id", requireLogin, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const id = req.params["id"];
        if (!id) {
            return res.status(400).json({ error: "Missing image id" });
        }
        const image = await prisma.images.findFirst({
            where: { id, userId },
        });

        if (!image) return res.status(404).json({ error: "Not found" });

        const drive = await prisma.drives.findUnique({ where: { id: image.driveId } });
        if (drive) {
            try {
                if (image.provider === "google" || image.provider === "onedrive") {
                    await deleteFromDrive(userId, image.provider, image.fileId);
                } else {
                    console.warn("Unknown provider, skipping drive delete:", image.provider);
                }
            } catch (driveErr) {
                console.warn("Drive delete failed:", driveErr);
            }
        }

        await prisma.image_tags.deleteMany({ where: { imageId: image.id } });
        await prisma.images.delete({ where: { id: image.id } });

        return res.json({ success: true });
    } catch (err) {
        console.error("Error deleting image:", err);
        return res.status(500).json({ error: "Delete failed" });
    }
});

export default router;
