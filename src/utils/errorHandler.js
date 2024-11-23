// src/utils/errorHandler.js
const { logger } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Global error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
};

module.exports = { errorHandler };