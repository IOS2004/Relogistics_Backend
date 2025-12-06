const express = require("express");
const router = express.Router();
const { addDriver, getMyDrivers } = require("../controllers/driverController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, addDriver).get(protect, getMyDrivers);

module.exports = router;
