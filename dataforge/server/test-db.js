import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    "postgresql://postgres:postgres123@localhost:5433/dataforge",
    {
        dialect: "postgres",
        logging: false,
    }
);

try {
    await sequelize.authenticate();
    console.log("✅ Connected Successfully");
} catch (error) {
    console.error("❌ Full Error:");
    console.error(error);
}