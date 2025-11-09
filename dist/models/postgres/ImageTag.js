import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class ImageTag extends Model {
}
ImageTag.init({
    imageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "images",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "tags",
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize,
    tableName: "image_tags",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["imageId", "tagId"],
        },
    ],
});
//# sourceMappingURL=ImageTag.js.map