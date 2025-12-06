const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Add a driver
// @route   POST /api/drivers
// @access  Private (Vehicle Owner)
const addDriver = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user with role 'driver' and link to employer (current user)
    const user = await User.create({
      name,
      phone,
      password,
      role: "driver",
      employer: req.user._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        employer: user.employer,
      });
    } else {
      res.status(400).json({ message: "Invalid driver data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my drivers
// @route   GET /api/drivers
// @access  Private (Vehicle Owner)
const getMyDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      employer: req.user._id,
      role: "driver",
    }).select("-password");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addDriver,
  getMyDrivers,
};
