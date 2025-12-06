const Booking = require("../models/Booking");
const Bid = require("../models/Bid");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Agent/Consumer)
const createBooking = async (req, res) => {
  const {
    customerPhone, // If provided, we look up or treat as unregistered
    pickupAddress,
    deliveryAddress,
    goodsDetails,
    priceEstimate,
  } = req.body;

  try {
    let customerId = null;
    let unregisteredCustomer = null;

    // Check if customer exists by phone
    if (customerPhone) {
      const user = await User.findOne({ phone: customerPhone });
      if (user) {
        customerId = user._id;
      } else {
        unregisteredCustomer = {
          phone: customerPhone,
          name: req.body.customerName || "Guest",
        };
      }
    } else if (req.user && req.user.role === "consumer") {
      customerId = req.user._id;
    }

    const trackingId = uuidv4();

    const booking = await Booking.create({
      customer: customerId,
      unregisteredCustomer,
      pickupAddress,
      deliveryAddress,
      goodsDetails,
      priceEstimate,
      trackingId,
      status: "pending", // Goes to admin for approval
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query = {};

    // If vehicle owner, show only 'bidding' status or assigned to them
    if (req.user.role === "vehicle_owner") {
      query = {
        $or: [{ status: "bidding" }, { assignedOwner: req.user._id }],
      };
    } else if (req.user.role === "consumer") {
      query = { customer: req.user._id };
    } else if (req.user.role === "agent") {
      query = { createdBy: req.user._id };
    }
    // Admins see all

    const bookings = await Booking.find(query)
      .populate("customer", "name phone")
      .populate("assignedVehicle");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("assignedVehicle");

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve booking (Admin)
// @route   PUT /api/bookings/:id/approve
// @access  Private (Admin)
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = "bidding"; // Move to bidding stage
      await booking.save();
      res.json(booking);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid
// @route   POST /api/bookings/:id/bid
// @access  Private (Vehicle Owner)
const placeBid = async (req, res) => {
  const { amount } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "bidding") {
      return res
        .status(400)
        .json({ message: "Booking is not open for bidding" });
    }

    const bid = await Bid.create({
      booking: booking._id,
      vehicleOwner: req.user._id,
      amount,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a bid (Agent/Admin)
// @route   PUT /api/bookings/:id/bids/:bidId/accept
// @access  Private (Agent/Admin)
const acceptBid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    const bid = await Bid.findById(req.params.bidId);

    if (!booking || !bid) {
      return res.status(404).json({ message: "Booking or Bid not found" });
    }

    if (booking.status !== "bidding") {
      return res
        .status(400)
        .json({ message: "Booking is not in bidding stage" });
    }

    // Update Bid status
    bid.status = "accepted";
    await bid.save();

    // Reject other bids? (Optional logic)

    // Update Booking
    booking.status = "assigned";
    booking.assignedOwner = bid.vehicleOwner;

    await booking.save();

    res.json({ booking, bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign Driver and Vehicle (Vehicle Owner)
// @route   PUT /api/bookings/:id/assign
// @access  Private (Vehicle Owner)
const assignDriverAndVehicle = async (req, res) => {
  const { driverId, vehicleId } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);

    // Verify ownership/permission logic here (omitted for brevity)

    booking.assignedDriver = driverId;
    booking.assignedVehicle = vehicleId;
    booking.status = "assigned"; // Confirm status
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Booking Status (Driver)
// @route   PUT /api/bookings/:id/status
// @access  Private (Driver)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'in-transit', 'delivered'
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking.assignedDriver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    // Notify Customer
    if (booking.customer) {
      await Notification.create({
        user: booking.customer,
        message: `Your booking status has been updated to: ${status}`,
        type: "booking_update",
        relatedId: booking._id,
      });
    }

    // If Delivered, Credit Wallet (Mock Logic)
    if (status === "delivered") {
      // Find the vehicle owner (employer of the driver)
      const driver = await User.findById(req.user._id);
      if (driver && driver.employer) {
        await Transaction.create({
          user: driver.employer,
          amount: booking.priceEstimate, // Assuming full price is credited
          type: "credit",
          description: `Payment for Booking #${booking.trackingId}`,
          booking: booking._id,
        });
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  approveBooking,
  placeBid,
  acceptBid,
  assignDriverAndVehicle,
  updateBookingStatus,
  trackBooking,
};
