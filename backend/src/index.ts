import express from "express";
import invoiceRouter from "./routes/invoices";
import { config } from "dotenv";
import {Client} from 'pg'
import { PrismaClient } from "@prisma/client";
import cors from "cors"

const prisma = new PrismaClient()

const app = express();
app.use(cors())
app.use(express.json())
app.use("/invoice", invoiceRouter);

config();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("index.ts file says hi");
});



app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
