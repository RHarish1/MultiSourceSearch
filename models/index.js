import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize(process.env.DATABASE_URL);

// Import models
import { User } from './User.js';
import { Drive } from './Drive.js';

// Export everything in one object
export const db = { sequelize, User, Drive };
