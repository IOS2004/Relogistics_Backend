const Vehicle = require("../models/Vehicle");

// @desc    Add a vehicle
// @route   POST /api/vehicles
// @access  Private (Vehicle Owner)
const addVehicle = async (req, res) => {
  const { plateNumber, type, capacity } = req.body;

  try {
    const vehicle = await Vehicle.create({
      owner: req.user._id,
      plateNumber,
      type,
      capacity,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my vehicles
// @route   GET /api/vehicles
// @access  Private (Vehicle Owner)
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
};
