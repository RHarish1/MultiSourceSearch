import { Model, Optional } from "sequelize";
export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    passwordHash: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export type UserCreationAttributes = Optional<UserAttributes, "id" | "passwordHash" | "createdAt" | "updatedAt">;
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    username: string;
    email: string;
    passwordHash: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=User.d.ts.map