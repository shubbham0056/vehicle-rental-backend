const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: { type: String, enum: ["Available", "Rented", "Maintenance"], default: "Available" },
  pricePerHour: Number,
  pricePerDay: Number,
  pricePerWeek: Number,
  image: String,
  location: { type: [Number], default: [27.7172, 85.3240] },
  fuel: String,
  transmission: String,
  seats: Number,
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);