import mongoose from 'mongoose';
const fileSchema = new mongoose.Schema({
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    name: { type: String, required: true },
    fileId: { type: String, required: true },
    mimeType: { type: String },
    tags: [String],
    addedAt: { type: Date, default: Date.now },
});
// Create a text index for search across name and tags
fileSchema.index({ name: 'text', tags: 'text' });
export const File = mongoose.model('File', fileSchema);
//# sourceMappingURL=file.js.map