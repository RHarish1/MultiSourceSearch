import { DataTypes } from 'sequelize';

export const defineUser = (sequelize) => {
    return sequelize.define(
        'User',
        {
            username: { type: DataTypes.STRING, allowNull: false, unique: true },
            email: { type: DataTypes.STRING },
            passwordHash: { type: DataTypes.STRING },
        },
        { freezeTableName: true }
    );
};
