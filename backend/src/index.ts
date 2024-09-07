import express from "express";
import invoiceRouter from "./routes/invoices";
import { config } from "dotenv";

const app = express();
config();
app.use("/invoice", invoiceRouter);

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hihihih");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
