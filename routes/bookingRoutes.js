const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  approveBooking,
  placeBid,
  trackBooking,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, createBooking) // Agent or Consumer
  .get(protect, getBookings); // All roles (filtered)

router.route("/:id").get(protect, getBookingById);

router.route("/:id/approve").put(protect, admin, approveBooking);

router.route("/:id/bid").post(protect, placeBid); // Vehicle Owner

router.route("/:id/bids/:bidId/accept").put(protect, acceptBid); // Agent/Admin

router.route("/:id/assign").put(protect, assignDriverAndVehicle); // Vehicle Owner

router.route("/:id/status").put(protect, updateBookingStatus); // Driver

router.route("/track/:trackingId").get(trackBooking); // Public

module.exports = router;
