import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const Image = sequelize.define('Image', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    fileId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
    },
    fileUrl: {
        type: DataTypes.STRING,
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
    },
    mimeType: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.INTEGER,
    },
    uploadedAt: {
        type: DataTypes.DATE,
    },
}, {
    timestamps: true,
});