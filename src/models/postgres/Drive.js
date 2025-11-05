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
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rootFolderId: {
        type: DataTypes.STRING,
        allowNull: true,
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
}, {
    tableName: 'drives',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'provider'],
        },
    ],
});
