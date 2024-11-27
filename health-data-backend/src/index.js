// src/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Import utils
const { errorHandler } = require("./utils/errorHandler");
const { logger } = require("./utils/logger");
const AuthMiddleware = require("./auth/auth");

// Import routes
const searchRoutes = require("../src/routes/search");
const healthDataRoutes = require("../src/routes/healthData");
const walletRoutes = require("./routes/wallet");
const authRoutes = require("./routes/auth");

// Import blockchain
const {
  provider,
  wallet,
  initializeContract,
  healthDataContract,
} = require("../src/blockchain/blockchain");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (CONTRACT_ADDRESS) {
  initializeContract(CONTRACT_ADDRESS);
  logger.info("Contract initialized at:", CONTRACT_ADDRESS);
} else {
  logger.warn("Warning: CONTRACT_ADDRESS not set in environment variables");
}

// Base route
app.get("/", (req, res) => {
  res.send("Welcome to the Health Data Monetization Backend");
});

// Public routes
app.use("/api/auth", authRoutes); // Add auth routes before protected routes

// Protected routes (require authentication)
app.use("/api", AuthMiddleware.authenticateToken, searchRoutes);
app.use("/api/health-data", AuthMiddleware.authenticateToken, healthDataRoutes);
app.use("/api/wallet", AuthMiddleware.authenticateToken, walletRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});

module.exports = app;
