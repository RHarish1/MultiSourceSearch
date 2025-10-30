import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const Drive = sequelize.define('Drive', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    provider: {
        type: DataTypes.ENUM('google', 'onedrive'),
        allowNull: false,
    },
    accessToken: DataTypes.TEXT,
    refreshToken: DataTypes.TEXT,
    expiry: DataTypes.DATE,
    email: DataTypes.STRING,
    rootFolderId: DataTypes.STRING,
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    tableName: 'Drives',
    timestamps: true,

    // 👇 Add this block
    indexes: [
        {
            unique: true,
            fields: ['userId', 'provider'],
        },
    ],
});
