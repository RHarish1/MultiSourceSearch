import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
});
