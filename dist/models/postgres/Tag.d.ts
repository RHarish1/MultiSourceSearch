import { Model, Optional } from "sequelize";
export interface TagAttributes {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type TagCreationAttributes = Optional<TagAttributes, "id" | "createdAt" | "updatedAt">;
export declare class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    id: string;
    name: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=Tag.d.ts.map