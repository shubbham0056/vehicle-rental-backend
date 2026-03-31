const express = require("express");
const router = express.Router();
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");
const { vendorMiddleware } = require("../middleware/authMiddleware");
const { validateVehicle } = require("../middleware/validate");

router.get("/", getVehicles);
router.post("/", vendorMiddleware, validateVehicle, addVehicle);
router.put("/:id", vendorMiddleware, validateVehicle, updateVehicle);
router.delete("/:id", vendorMiddleware, deleteVehicle);

module.exports = router;
