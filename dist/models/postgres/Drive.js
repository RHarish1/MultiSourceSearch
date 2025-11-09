import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class Drive extends Model {
}
Drive.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    provider: {
        type: DataTypes.ENUM("google", "onedrive"),
        allowNull: false,
    },
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rootFolderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize,
    tableName: "drives",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "provider"],
        },
    ],
});
//# sourceMappingURL=Drive.js.map