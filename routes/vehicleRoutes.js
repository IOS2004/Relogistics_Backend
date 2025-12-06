const express = require("express");
const router = express.Router();
const {
  addVehicle,
  getMyVehicles,
} = require("../controllers/vehicleController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, addVehicle).get(protect, getMyVehicles);

module.exports = router;
