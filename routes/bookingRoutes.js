const express = require("express");
const router = express.Router();
const { checkAvailability, createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require("../controllers/bookingController");
const { authMiddleware, vendorMiddleware } = require("../middleware/authMiddleware");
const { validateBooking, validateStatusUpdate } = require("../middleware/validate");

router.get("/availability", checkAvailability);
router.post("/", authMiddleware, validateBooking, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/all", vendorMiddleware, getAllBookings);
router.put("/:id/status", vendorMiddleware, validateStatusUpdate, updateBookingStatus);

module.exports = router;
