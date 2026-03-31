const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  vehicleId:      { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  startTime:      { type: Date,   required: true },
  endTime:        { type: Date,   required: true },
  totalPrice:     { type: Number, required: true },
  status:         { type: String, enum: ["Pending", "Active", "Completed", "Cancelled"], default: "Pending" },
  pickupLocation: { type: [Number], default: undefined },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus:  { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);