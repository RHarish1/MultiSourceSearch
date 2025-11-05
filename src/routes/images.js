import express from 'express';
import multer from 'multer';
import { Op } from 'sequelize';
import { db } from '../models/postgres/index.js';
import { uploadToDrive, deleteFromDrive } from '../utils/driveUtils.js';
import requireLogin from '../middleware/requireLogin.js';
import refreshDrives from '../middleware/refreshDrives.js'; // auto-refresh


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { Image, Tag, ImageTag, Drive } = db;

// ======================================================
//              GET IMAGES / 
// ======================================================
router.get('/', requireLogin, refreshDrives, async (req, res) => {

    try {
        const userId = req.session.userId;
        const { search } = req.query;

        const where = { userId };
        if (search) {
            where.fileName = { [Op.iLike]: `%${search}%` }; // case-insensitive LIKE
        }

        const images = await Image.findAll({
            where,
            include: [{ model: Tag, through: { attributes: [] } }],
            order: [['createdAt', 'DESC']]
        });

        res.json(images.map(img => ({
            id: img.id,
            fileName: img.fileName,
            fileUrl: img.fileUrl,
            tags: img.Tags.map(t => t.name),
        })));
    } catch (err) {
        console.error('Error fetching images:', err);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// ======================================================
//              GET IMAGES / SEARCH
// ======================================================
router.get('/search', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const q = (req.query.q || '').trim();
        const and = req.query.and === 'true';

        if (!userId) return res.status(401).json({ error: 'Not logged in' });
        if (!q) return res.status(400).json({ error: 'Missing query' });

        // Split query into multiple tokens if comma/space-separated
        const tokens = q.split(/[, ]+/).filter(Boolean);

        // Main conditions
        const fileNameConditions = tokens.map(t => ({
            fileName: { [Op.iLike]: `%${t}%` },
        }));

        const tagConditions = tokens.map(t => ({
            '$Tags.name$': { [Op.iLike]: `%${t}%` },
        }));

        // Combine conditions (AND vs OR)
        const whereClause = and
            ? { [Op.and]: [{ userId }, { [Op.or]: [...fileNameConditions, ...tagConditions] }] }
            : { [Op.and]: [{ userId }, { [Op.or]: [...fileNameConditions, ...tagConditions] }] };

        const images = await Image.findAll({
            where: whereClause,
            include: [
                {
                    model: Tag,
                    through: { model: ImageTag, attributes: [] },
                    attributes: ['name'],
                },
            ],
            distinct: true,
        });

        // Transform output
        const result = images.map(img => ({
            id: img.id,
            fileName: img.fileName,
            fileUrl: img.fileUrl,
            tags: img.Tags.map(t => t.name),
        }));

        res.json({ images: result });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});


// ======================================================
//                  UPLOAD IMAGE
// ======================================================
router.post('/upload', requireLogin, upload.single('file'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const { provider, tags, fileName } = req.body;

        const drive = await Drive.findOne({ where: { userId, provider } });
        if (!drive) return res.status(400).json({ error: 'Drive not linked.' });

        // Upload file to provider (Google Drive / OneDrive)
        const uploaded = await uploadToDrive(userId, provider, req.file);

        // Save image record
        const image = await Image.create({
            userId,
            driveId: drive.id,
            provider,
            fileId: uploaded.id,
            fileName: fileName || req.file.originalname,
            fileUrl: uploaded.url,
            uploadedAt: new Date(),
        });

        // Handle tags
        const tagNames = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        for (const name of tagNames) {
            const [tag] = await Tag.findOrCreate({ where: { userId, name } });
            await ImageTag.create({ imageId: image.id, tagId: tag.id });
        }

        res.json({ success: true, imageId: image.id });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});



// ======================================================
//                  EDIT IMAGE
// ======================================================
router.put('/:id', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { fileName, tags } = req.body;

        const image = await Image.findOne({ where: { id: req.params.id, userId } });
        if (!image) return res.status(404).json({ error: 'Not found' });

        if (fileName) image.fileName = fileName;
        await image.save();

        // Update tags
        await ImageTag.destroy({ where: { imageId: image.id } });
        const tagNames = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        for (const name of tagNames) {
            const [tag] = await Tag.findOrCreate({ where: { userId, name } });
            await ImageTag.create({ imageId: image.id, tagId: tag.id });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error editing image:', err);
        res.status(500).json({ error: 'Edit failed' });
    }
});



// ======================================================
//                  DELETE IMAGE
// ======================================================
router.delete('/:id', requireLogin, async (req, res) => {
    try {
        const userId = req.session.userId;
        const image = await Image.findOne({ where: { id: req.params.id, userId } });
        if (!image) return res.status(404).json({ error: 'Not found' });

        const drive = await Drive.findByPk(image.driveId);
        if (drive) await deleteFromDrive(userId, image.provider, image.fileId);

        await ImageTag.destroy({ where: { imageId: image.id } });
        await image.destroy();

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
});



export default router;
