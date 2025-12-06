const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  unregisteredCustomer: {
    name: String,
    phone: String,
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    lat: Number,
    lng: Number,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    lat: Number,
    lng: Number,
  },
  goodsDetails: {
    description: String,
    weight: Number,
    quantity: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "bidding",
      "assigned",
      "in-transit",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  trackingId: {
    type: String,
    unique: true,
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming driver is also a User
  },
  assignedOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The Vehicle Owner who won the bid
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The Agent or Consumer who created the booking
  },
  priceEstimate: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
