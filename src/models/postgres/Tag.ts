import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface TagAttributes {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TagCreationAttributes = Optional<TagAttributes, "id" | "createdAt" | "updatedAt">;

export class Tag
    extends Model<TagAttributes, TagCreationAttributes>
    implements TagAttributes {
    declare id: string;
    declare name: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Tag.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "tags",
        timestamps: true,
    }
);
