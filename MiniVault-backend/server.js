import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import credentialsRoutes from "./routes/credentialsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/credentials", credentialsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Placeholder for server start logging or additional setup
});

