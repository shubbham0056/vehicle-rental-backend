const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const { sendPaymentConfirmationEmail } = require("../utils/email");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("vehicleId");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Only the booking owner can pay
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ msg: "Booking is already paid" });
    }

    if (booking.status !== "Active") {
      return res.status(400).json({ msg: "Payment is only allowed for approved bookings" });
    }

    const order = await razorpay.orders.create({
      amount:   Math.round(booking.totalPrice * 100), // paise
      currency: "INR",
      receipt:  `booking_${bookingId}`,
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      vehicle:   booking.vehicleId?.name || "Vehicle",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    const booking = await Booking.findById(bookingId).populate("userId", "name email").populate("vehicleId", "name");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentStatus     = "paid";
    booking.status            = "Completed";
    await booking.save();

    // Notify vendor about payment
    const io = req.app.get("io");
    if (io) {
      io.emit("paymentReceived", {
        bookingId: booking._id,
        vehicle:   booking.vehicleId?.name || "Vehicle",
        amount:    booking.totalPrice,
        message:   `Payment of ₹${booking.totalPrice} received for ${booking.vehicleId?.name || "vehicle"}.`,
      });
    }

    // Send confirmation email
    try {
      await sendPaymentConfirmationEmail(
        booking.userId.email,
        booking.userId.name,
        booking.vehicleId?.name,
        booking.totalPrice,
        razorpay_payment_id
      );
    } catch (emailErr) {
      console.error("Payment confirmation email failed:", emailErr.message);
    }

    res.json({ msg: "Payment successful", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
