import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { sequelize } from "./db";

dotenv.config();

const app: Application = express();

app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB conectada");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error iniciando servidor/DB:", err);
    process.exit(1);
  }
}

main();

export default app;
