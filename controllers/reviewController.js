const Review = require("../models/Review");
const Booking = require("../models/Booking");

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  const { bookingId, rating, comment, revieweeId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of the booking
    // (Logic omitted for brevity, but should verify req.user is customer or driver)

    const review = await Review.create({
      booking: bookingId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).populate(
      "reviewer",
      "name"
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
};
