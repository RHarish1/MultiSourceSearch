import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface ImageAttributes {
    id: string;
    userId: string;
    driveId: string;
    fileId: string;
    provider: string;
    fileName?: string | null;
    fileUrl?: string | null;
    thumbnailUrl?: string | null;
    mimeType?: string | null;
    size?: number | null;
    uploadedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Fields optional during creation
export type ImageCreationAttributes = Optional<
    ImageAttributes,
    | "id"
    | "fileName"
    | "fileUrl"
    | "thumbnailUrl"
    | "mimeType"
    | "size"
    | "uploadedAt"
    | "createdAt"
    | "updatedAt"
>;

export class Image
    extends Model<ImageAttributes, ImageCreationAttributes>
    implements ImageAttributes {
    declare id: string;
    declare userId: string;
    declare driveId: string;
    declare fileId: string;
    declare provider: string;
    declare fileName?: string | null;
    declare fileUrl?: string | null;
    declare thumbnailUrl?: string | null;
    declare mimeType?: string | null;
    declare size?: number | null;
    declare uploadedAt?: Date;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Image.init(
    {
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
    },
    {
        sequelize,
        tableName: "images",
        timestamps: true,
    }
);
