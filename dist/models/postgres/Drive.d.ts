import { Model, Optional } from "sequelize";
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
type DriveCreationAttributes = Optional<DriveAttributes, "id" | "expiry" | "email" | "rootFolderId" | "createdAt" | "updatedAt">;
export declare class Drive extends Model<DriveAttributes, DriveCreationAttributes> implements DriveAttributes {
    id: string;
    provider: "google" | "onedrive";
    accessToken: string;
    refreshToken: string;
    expiry: Date | null;
    email: string | null;
    rootFolderId: string | null;
    userId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=Drive.d.ts.map