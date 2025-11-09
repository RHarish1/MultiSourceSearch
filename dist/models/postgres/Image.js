import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class Image extends Model {
}
Image.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
    driveId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "drives",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    fileId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: "images",
    timestamps: true,
});
//# sourceMappingURL=Image.js.map