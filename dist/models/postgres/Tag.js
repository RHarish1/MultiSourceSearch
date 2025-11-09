import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
export class Tag extends Model {
}
Tag.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "tags",
    timestamps: true,
});
//# sourceMappingURL=Tag.js.map