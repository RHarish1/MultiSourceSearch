import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const dbUrl = process.env["DATABASE_URL"];
if (!dbUrl) {
    throw new Error("DATABASE_URL not set in environment variables");
}
export const sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    logging: false,
});
//# sourceMappingURL=sequelize.js.map