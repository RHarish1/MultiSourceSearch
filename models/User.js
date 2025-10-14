import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL);

const User = sequelize.define('User', {
    username: DataTypes.STRING,
    hashedPassword: DataTypes.STRING
});