// src/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet"); // Add security headers
const rateLimit = require("express-rate-limit"); // Add rate limiting
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Import utils
const { errorHandler } = require("./utils/errorHandler");
const { logger } = require("./utils/logger");
const AuthMiddleware = require("./auth/auth");

// Import routes
const searchRoutes = require("./routes/search");
const healthDataRoutes = require("./routes/healthData");
const walletRoutes = require("./routes/wallet");
const authRoutes = require("./routes/auth");

// Import blockchain
const {
  provider,
  wallet,
  initializeContract,
  healthDataContract,
} = require("./blockchain/blockchain");

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with limits
app.use(bodyParser.json({ limit: "10kb" })); // Limit body size
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Initialize contract
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (CONTRACT_ADDRESS) {
  try {
    initializeContract(CONTRACT_ADDRESS);
    logger.info("Contract initialized at:", CONTRACT_ADDRESS);
  } catch (error) {
    logger.error("Contract initialization failed:", error);
  }
} else {
  logger.warn("Warning: CONTRACT_ADDRESS not set in environment variables");
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    blockchain: {
      connected: !!healthDataContract,
      network: provider?.network?.name,
    },
  });
});

// Base route
app.get("/", (req, res) => {
  res.send("Welcome to the Health Data Monetization Backend");
});

// Routes
app.use("/api/auth", authRoutes);

// Protected routes middleware
const protectedRoute = AuthMiddleware.authenticateToken;

// Protected routes
app.use("/api/search", protectedRoute, searchRoutes);
app.use("/api/health-data", protectedRoute, healthDataRoutes);
app.use("/api/wallet", protectedRoute, walletRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated");
  });
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
