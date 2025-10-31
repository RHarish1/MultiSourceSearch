import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'tags',
    timestamps: true,
});
