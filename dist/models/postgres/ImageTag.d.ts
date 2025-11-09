import { Model, Optional } from "sequelize";
export interface ImageTagAttributes {
    imageId: string;
    tagId: string;
}
export type ImageTagCreationAttributes = Optional<ImageTagAttributes, never>;
export declare class ImageTag extends Model<ImageTagAttributes, ImageTagCreationAttributes> implements ImageTagAttributes {
    imageId: string;
    tagId: string;
}
//# sourceMappingURL=ImageTag.d.ts.map