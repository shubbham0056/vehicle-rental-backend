const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  email:              { type: String, unique: true, required: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ["user", "vendor"], default: "user" },
  isVerified:          { type: Boolean, default: false },
  verificationToken:   { type: String },
  verificationExpiry:  { type: Date },
  resetPasswordToken:  { type: String },
  resetPasswordExpiry: { type: Date },
  refreshToken:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);