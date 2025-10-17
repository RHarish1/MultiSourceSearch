import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const defineUser = (sequelize, Sequelize) => {
    return sequelize.define(
        'User',
        {
            username: DataTypes.STRING,
            email: DataTypes.STRING
        },
        {
            freezeTableName: true
        }
    );
}