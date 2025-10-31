import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const Image = sequelize.define('Image', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    driveId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'drives',
            key: 'id',
        },
        onDelete: 'CASCADE',
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
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'images',
    timestamps: true,
});
