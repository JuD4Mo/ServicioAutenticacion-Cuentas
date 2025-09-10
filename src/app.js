import express from "express";
import 'dotenv/config';
import cuentaRouter from "./routers/cuentasRouter.js"
import cors from "cors";

const app = express();
app.use(cors({
      origin: "https://www.devcorebits.com"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => res.send("OK"));
app.use("/cuenta", cuentaRouter);

const PORT = 3008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
