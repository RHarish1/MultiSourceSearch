import { sequelize } from './db.js';
import { defineUser } from './User.js';
import { defineDrive } from './Drive.js';

// define models
export const User = defineUser(sequelize);
export const Drive = defineDrive(sequelize);

// associations
User.hasMany(Drive, { onDelete: 'CASCADE' });
Drive.belongsTo(User);
await sequelize.sync({ alter: true });

export const db = { sequelize, User, Drive };
