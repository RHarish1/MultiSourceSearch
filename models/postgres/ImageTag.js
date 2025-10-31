import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const ImageTag = sequelize.define('ImageTag', {
    imageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'images',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'tags',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'image_tags',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['imageId', 'tagId'],
        },
    ],
});
