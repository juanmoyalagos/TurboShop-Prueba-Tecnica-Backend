import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./db";
import routes from "./router";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

app.get("/", (req: Request, res: Response) => {
  res.send("Bienvenido al servidor de Express & TypeScript");
});

app.use(routes);

async function main() {
  try {
    await sequelize.authenticate();
    console.log("DB conectada");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto: ${PORT}`);
    });
  } catch (err) {
    console.error("Error iniciando servidor/DB:", err);
    process.exit(1);
  }
}

main();

export default app;
