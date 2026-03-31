const { body, validationResult } = require("express-validator");

// Middleware to check validation results and return errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ field: e.path, msg: e.msg })) });
  }
  next();
};

// ===== AUTH =====
const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  handleValidation,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  handleValidation,
];

// ===== VEHICLES =====
const validateVehicle = [
  body("name")
    .trim()
    .notEmpty().withMessage("Vehicle name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("type")
    .trim()
    .notEmpty().withMessage("Vehicle type is required")
    .isIn(["Sedan", "SUV", "Van", "Bike", "Scooty", "Truck", "Luxury"]).withMessage("Invalid vehicle type"),
  body("status")
    .optional()
    .isIn(["Available", "Rented", "Maintenance"]).withMessage("Invalid status"),
  body("pricePerHour")
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage("Price per hour must be a positive number"),
  body("pricePerDay")
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage("Price per day must be a positive number"),
  body("pricePerWeek")
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage("Price per week must be a positive number"),
  body("seats")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 50 }).withMessage("Seats must be between 1 and 50"),
  body("fuel")
    .optional()
    .isIn(["Petrol", "Diesel", "Electric", "Hybrid"]).withMessage("Invalid fuel type"),
  body("transmission")
    .optional()
    .isIn(["Auto", "Manual"]).withMessage("Invalid transmission type"),
  handleValidation,
];

// ===== BOOKINGS =====
const validateBooking = [
  body("vehicleId")
    .notEmpty().withMessage("Vehicle ID is required")
    .isMongoId().withMessage("Invalid vehicle ID"),
  body("startTime")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Start date must be a valid date")
    .custom((value) => {
      if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),
  body("endTime")
    .notEmpty().withMessage("End date is required")
    .isISO8601().withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("totalPrice")
    .notEmpty().withMessage("Total price is required")
    .isFloat({ min: 0 }).withMessage("Total price must be a positive number"),
  body("pickupLocation")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Pickup location must be under 200 characters"),
  handleValidation,
];

const validateStatusUpdate = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["Pending", "Active", "Completed", "Cancelled"]).withMessage("Invalid status value"),
  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateVehicle, validateBooking, validateStatusUpdate };
