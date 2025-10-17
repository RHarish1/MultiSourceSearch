export const defineDrive = (sequelize, DataTypes) => {
    return sequelize.define(
        'Drive',
        {
            name: DataTypes.STRING,
            path: DataTypes.STRING
        },
        {
            freezeTableName: true
        }
    )
};