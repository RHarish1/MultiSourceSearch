import { sequelize } from "./sequelize.js";
import { User } from "./User.js";
import { Drive } from "./Drive.js";
import { Image } from "./Image.js";
import { Tag } from "./Tag.js";
import { ImageTag } from "./ImageTag.js";

// ---------------------------
// Model Associations
// ---------------------------

// User -> Drive (1:N)
User.hasMany(Drive, {
    foreignKey: "userId",
    as: "drives",
});
Drive.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// Drive -> Image (1:N)
Drive.hasMany(Image, {
    foreignKey: "driveId",
    as: "images",
});
Image.belongsTo(Drive, {
    foreignKey: "driveId",
    as: "drive",
});

// User -> Image (1:N)
User.hasMany(Image, {
    foreignKey: "userId",
    as: "images",
});
Image.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// User -> Tag (1:N)
User.hasMany(Tag, {
    foreignKey: "userId",
    as: "tags",
});
Tag.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// Image <-> Tag (N:M)
Image.belongsToMany(Tag, {
    through: ImageTag,
    foreignKey: "imageId",
    otherKey: "tagId",
    as: "tags",
});
Tag.belongsToMany(Image, {
    through: ImageTag,
    foreignKey: "tagId",
    otherKey: "imageId",
    as: "images",
});

// ---------------------------
// Database object export
// ---------------------------
export const db = {
    sequelize,
    User,
    Drive,
    Image,
    Tag,
    ImageTag,
};
