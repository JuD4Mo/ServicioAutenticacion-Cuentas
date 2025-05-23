import express from "express";
import 'dotenv/config';
import cuentaRouter from "./routers/cuentasRouter.js"
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/cuenta", cuentaRouter);

const PORT = 3008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
