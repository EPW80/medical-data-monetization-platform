// validation.js
const Joi = require("joi");

const healthDataSchema = Joi.object({
  healthData: Joi.object({
    type: Joi.string()
      .required()
      .valid(
        "blood_pressure",
        "heart_rate",
        "glucose_level",
        "temperature",
        "oxygen_saturation"
      ),
    value: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
    patientId: Joi.string().required(),
    notes: Joi.string().optional(),
    unit: Joi.string().optional(),
  }).required(),

  consent: Joi.boolean().required().valid(true),
});

// Validate health data
const validateHealthData = (req, res, next) => {
  const { error } = healthDataSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid data format",
      details: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateHealthData,
};
