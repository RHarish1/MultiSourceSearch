import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./sequelize.js";

export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    passwordHash: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
    UserAttributes,
    "id" | "passwordHash" | "createdAt" | "updatedAt"
>;

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare id: string;
    declare username: string;
    declare email: string;
    declare passwordHash: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: true,
    }
);
