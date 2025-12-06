const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  checkPhone,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-phone", checkPhone);

module.exports = router;
