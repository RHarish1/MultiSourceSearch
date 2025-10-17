import { Sequelize } from 'sequelize';
import { defineUser } from './User.js';
import { defineDrive } from './Drive.js';
import dotenv from 'dotenv';
dotenv.config();
export const sequelize = new Sequelize(process.env.DATABASE_URL);

// Pass sequelize and Sequelize to define models
export const User = defineUser(sequelize, Sequelize);
export const Drive = defineDrive(sequelize, Sequelize);
User.hasMany(Drive, { onDelete: 'CASCADE' });
Drive.belongsTo(User);
export const db = { sequelize, User, Drive };
