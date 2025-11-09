import { Model, Optional } from "sequelize";
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
export type ImageCreationAttributes = Optional<ImageAttributes, "id" | "fileName" | "fileUrl" | "thumbnailUrl" | "mimeType" | "size" | "uploadedAt" | "createdAt" | "updatedAt">;
export declare class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=Image.d.ts.map