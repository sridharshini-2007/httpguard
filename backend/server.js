
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

const requestRoutes = require("./routes/requestRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://httpguard-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HTTP Guard Backend is running",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});

app.use("/api/requests", requestRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`HTTP Guard Server running on port ${PORT}`);
  });
};

startServer();
