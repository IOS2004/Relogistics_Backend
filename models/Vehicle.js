const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true, // e.g., 'Truck', 'Van'
  },
  capacity: {
    type: Number, // in kg
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "busy", "maintenance"],
    default: "available",
  },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
