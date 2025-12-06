const express = require("express");
const router = express.Router();
const { getWallet, getStats } = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getWallet);
router.route("/stats").get(protect, getStats);

module.exports = router;
