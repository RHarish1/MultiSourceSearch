import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';
import { User } from './User.js';

export const Drive = sequelize.define('Drive', {
    provider: DataTypes.STRING,      // 'gdrive', 'onedrive', etc.
    accessToken: DataTypes.TEXT,     // store encrypted
    refreshToken: DataTypes.TEXT,    // optional
    expiresAt: DataTypes.DATE,       // optional
});

// Associations
User.hasMany(Drive, { foreignKey: 'userId' });
Drive.belongsTo(User, { foreignKey: 'userId' });
