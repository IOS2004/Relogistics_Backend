const Transaction = require("../models/Transaction");
const Booking = require("../models/Booking");

// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const balance = transactions.reduce((acc, item) => {
      return item.type === "credit" ? acc + item.amount : acc - item.amount;
    }, 0);

    res.json({ balance, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (Earnings, Trips)
// @route   GET /api/wallet/stats
// @access  Private (Vehicle Owner/Driver)
const getStats = async (req, res) => {
  try {
    // Calculate total earnings
    const transactions = await Transaction.find({
      user: req.user._id,
      type: "credit",
    });
    const totalEarnings = transactions.reduce(
      (acc, item) => acc + item.amount,
      0
    );

    // Calculate completed trips
    // If Vehicle Owner, find bookings where assignedVehicle belongs to them (simplified: check if they were the bidder/owner)
    // For now, let's assume we query bookings where assignedDriver is linked to them or they are the owner.
    // This logic depends on how we link bookings to owners strictly.
    // Let's use the Transaction records as a proxy for completed paid trips for now.
    const completedTrips = transactions.length;

    res.json({ totalEarnings, completedTrips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWallet,
  getStats,
};
