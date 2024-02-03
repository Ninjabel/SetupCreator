import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./controllers/auth";
import partsRouter from "./controllers/parts";
import setupsRouter from "./controllers/setups";
import categoriesRouter from "./controllers/categories";
import swaggerDocs from "./utils/swagger";

import "dotenv/config";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRouter);
app.use("/parts", partsRouter);
app.use("/setups", setupsRouter);
app.use("/categories", categoriesRouter);

app.listen(3000);

swaggerDocs(app, 3000);
