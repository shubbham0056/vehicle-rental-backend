const Vehicle = require("../models/Vehicle");

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const { name, type, status, pricePerHour, pricePerDay, pricePerWeek, image, location, fuel, transmission, seats } = req.body;
    const vehicle = await Vehicle.create({ name, type, status, pricePerHour, pricePerDay, pricePerWeek, image, location, fuel, transmission, seats });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { name, type, status, pricePerHour, pricePerDay, pricePerWeek, image, location, fuel, transmission, seats } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { name, type, status, pricePerHour, pricePerDay, pricePerWeek, image, location, fuel, transmission, seats },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    res.json({ msg: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
