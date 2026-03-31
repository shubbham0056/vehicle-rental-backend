const Booking = require("../models/Booking");
const { sendPaymentLinkEmail } = require("../utils/email");

// Check availability for a vehicle between two dates (public)
exports.checkAvailability = async (req, res) => {
  try {
    const { vehicleId, startTime, endTime } = req.query;
    if (!vehicleId || !startTime || !endTime) {
      return res.status(400).json({ msg: "vehicleId, startTime and endTime are required" });
    }

    const conflict = await Booking.findOne({
      vehicleId,
      status: { $in: ["Pending", "Active"] },
      startTime: { $lt: new Date(endTime) },
      endTime:   { $gt: new Date(startTime) },
    });

    res.json({ available: !conflict });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
const MAX_BOOKING_DAYS = 30;

exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, startTime, endTime, totalPrice, pickupLocation } = req.body;

    const start = new Date(startTime);
    const end   = new Date(endTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // startTime must not be in the past
    if (start < today) {
      return res.status(400).json({ msg: "Pickup date cannot be in the past." });
    }

    // endTime must be after startTime
    if (end <= start) {
      return res.status(400).json({ msg: "Return date must be after the pickup date." });
    }

    // Booking duration validation — max 30 days for daily, max 24 hours for hourly
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays  = diffMs / (1000 * 60 * 60 * 24);
    if (diffHours < 1) {
      return res.status(400).json({ msg: "Minimum booking duration is 1 hour." });
    }
    if (diffDays > MAX_BOOKING_DAYS) {
      return res.status(400).json({ msg: `Booking duration cannot exceed ${MAX_BOOKING_DAYS} days.` });
    }

    // Check for overlapping bookings on the same vehicle
    const conflict = await Booking.findOne({
      vehicleId,
      status: { $in: ["Pending", "Active"] },
      startTime: { $lt: new Date(endTime) },
      endTime:   { $gt: new Date(startTime) },
    });

    if (conflict) {
      return res.status(409).json({
        msg: "Vehicle is not available for the selected dates. Please choose different dates.",
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      vehicleId,
      startTime,
      endTime,
      totalPrice,
      pickupLocation,
    });

    // Notify all vendors of new booking
    const io = req.app.get("io");
    if (io) {
      io.emit("bookingCreated", {
        bookingId: booking._id,
        message:   `New booking received for vehicle.`,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// User: get only their own bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate("vehicleId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Vendor: get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicleId").populate("userId", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Vendor: update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("vehicleId", "name")
      .populate("userId", "name email");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = status;
    await booking.save();

    // Emit real-time notification to the booking owner
    const io = req.app.get("io");
    if (io) {
      io.to(booking.userId._id.toString()).emit("bookingUpdate", {
        bookingId: booking._id,
        status,
        vehicle:  booking.vehicleId?.name || "Vehicle",
        message:  `Your booking for ${booking.vehicleId?.name || "vehicle"} has been ${status === "Active" ? "approved" : status === "Cancelled" ? "rejected" : status.toLowerCase()}.`,
      });
    }

    // When vendor approves, send payment link email to user
    if (status === "Active") {
      try {
        await sendPaymentLinkEmail(
          booking.userId.email,
          booking.userId.name,
          booking.vehicleId?.name,
          booking.totalPrice,
          booking._id
        );
      } catch (emailErr) {
        console.error("Payment link email failed:", emailErr.message);
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
