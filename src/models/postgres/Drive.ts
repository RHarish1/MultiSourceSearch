import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface DriveAttributes {
    id: string;
    provider: "google" | "onedrive";
    accessToken: string;
    refreshToken: string;
    expiry: Date | null;
    email: string | null;
    rootFolderId: string | null;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type DriveCreationAttributes = Optional<
    DriveAttributes,
    "id" | "expiry" | "email" | "rootFolderId" | "createdAt" | "updatedAt"
>;

export class Drive
    extends Model<DriveAttributes, DriveCreationAttributes>
    implements DriveAttributes {
    declare id: string;
    declare provider: "google" | "onedrive";
    declare accessToken: string;
    declare refreshToken: string;
    declare expiry: Date | null;
    declare email: string | null;
    declare rootFolderId: string | null;
    declare userId: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Drive.init(
    {
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
            allowNull: false,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false,
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
    },
    {
        sequelize,
        tableName: "drives",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "provider"],
            },
        ],
    }
);
