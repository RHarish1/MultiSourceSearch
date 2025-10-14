import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
});