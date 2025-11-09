import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface ImageTagAttributes {
    imageId: string;
    tagId: string;
}

export type ImageTagCreationAttributes = Optional<ImageTagAttributes, never>;

export class ImageTag
    extends Model<ImageTagAttributes, ImageTagCreationAttributes>
    implements ImageTagAttributes {
    declare imageId: string;
    declare tagId: string;
}

ImageTag.init(
    {
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
    },
    {
        sequelize,
        tableName: "image_tags",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["imageId", "tagId"],
            },
        ],
    }
);
