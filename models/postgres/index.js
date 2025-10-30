import { sequelize } from './sequelize.js';
import { User } from './User.js';
import { Drive } from './Drive.js';
import { Image } from './Image.js';
import { Tag } from './Tag.js';
import { ImageTag } from './ImageTag.js';

// --- Associations ---

// User -> Drive
User.hasMany(Drive, { foreignKey: 'userId' });
Drive.belongsTo(User, { foreignKey: 'userId' });

// Drive -> Image
Drive.hasMany(Image, { foreignKey: 'driveId' });
Image.belongsTo(Drive, { foreignKey: 'driveId' });

// User -> Image (optional but useful)
User.hasMany(Image, { foreignKey: 'userId' });
Image.belongsTo(User, { foreignKey: 'userId' });

// User -> Tag
User.hasMany(Tag, { foreignKey: 'userId' });
Tag.belongsTo(User, { foreignKey: 'userId' });

// Image <-> Tag many-to-many
Image.belongsToMany(Tag, { through: ImageTag, foreignKey: 'imageId' });
Tag.belongsToMany(Image, { through: ImageTag, foreignKey: 'tagId' });

export const db = { sequelize, User, Drive, Image, Tag, ImageTag };
