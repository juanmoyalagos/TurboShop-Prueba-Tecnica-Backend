import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { models } from "./models";

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.NODE_ENV === "test" ? process.env.DB_TEST_NAME : process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialect: (process.env.DB_DIALECT || "postgres") as any,
  logging: false,
  models,
});
