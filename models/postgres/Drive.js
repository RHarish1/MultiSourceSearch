import { DataTypes } from 'sequelize';

export const defineDrive = (sequelize) => {
    return sequelize.define(
        'Drive',
        {
            provider: { type: DataTypes.STRING, allowNull: false }, // 'google' or 'microsoft'
            accessToken: { type: DataTypes.STRING },
            refreshToken: { type: DataTypes.STRING },
        },
        { freezeTableName: true }
    );
};
