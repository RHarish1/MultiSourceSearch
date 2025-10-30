import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const ImageTag = sequelize.define('ImageTag', {
    // no id — composite key via imageId + tagId
    imageId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: false,
});