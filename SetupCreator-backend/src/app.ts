import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./controllers/auth";
import partsRouter from "./controllers/parts";
import setupsRouter from "./controllers/setups";
import categoriesRouter from "./controllers/categories";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRouter);
app.use("/parts", partsRouter);
app.use("/setups", setupsRouter);
app.use("/categories", categoriesRouter);

export default app;
