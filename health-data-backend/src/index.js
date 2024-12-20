const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import routes
const { router: authRouter, authenticateToken } = require("./routes/auth");
const healthDataRoutes = require("./routes/healthData");
const walletRoutes = require("./routes/wallet");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Home route
app.get("/", (req, res) => {
  res.json({
    name: "Health Data Monetization API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      healthData: "/api/health-data",
      wallet: "/api/wallet",
    },
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/health-data", authenticateToken, healthDataRoutes);
app.use("/api/wallet", authenticateToken, walletRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

module.exports = app;
