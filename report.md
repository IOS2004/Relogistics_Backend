# Backend Development Report - Relogistics Platform

## Overview

This report summarizes the backend development work completed for the Relogistics platform. The backend is built using the **MERN stack** (MongoDB, Express.js, React/Node.js) and is designed to support three primary user applications: **Consumer**, **Booking Agent**, and **Vehicle Owner**.

## 1. Project Setup & Architecture

- **Framework**: Node.js with Express.js.
- **Database**: MongoDB (using Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing.
- **Structure**: MVC (Model-View-Controller) pattern.
- **Environment**: Configured via `.env` for sensitive credentials.

## 2. Database Schema (Models)

We designed and implemented the following Mongoose models to support the platform's complex relationships:

| Model            | Description                                  | Key Fields                                                                                                                   |
| :--------------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **User**         | Unified user entity for all roles.           | `name`, `phone`, `password`, `role` (consumer, agent, vehicle_owner, driver, admin), `employer` (for drivers).               |
| **Booking**      | Core entity tracking the shipment lifecycle. | `status` (pending, bidding, assigned, etc.), `pickup/delivery`, `trackingId`, `customer`, `assignedOwner`, `assignedDriver`. |
| **Vehicle**      | Trucks managed by vehicle owners.            | `plateNumber`, `type`, `capacity`, `owner`.                                                                                  |
| **Bid**          | Bids placed by owners on approved bookings.  | `amount`, `status`, `vehicleOwner`, `booking`.                                                                               |
| **Notification** | System alerts for users.                     | `message`, `type`, `isRead`, `user`.                                                                                         |
| **Transaction**  | Wallet history for earnings.                 | `amount`, `type` (credit/debit), `user`, `booking`.                                                                          |
| **Review**       | Ratings and feedback.                        | `rating`, `comment`, `reviewer`, `reviewee`.                                                                                 |

## 3. Implemented Modules & Features

### A. Authentication & User Management

- **Registration/Login**: Secure endpoints for all user roles.
- **Phone Check**: Specialized endpoint (`/api/auth/check-phone`) for Booking Agents to instantly verify if a customer exists before creating a booking.
- **Driver Onboarding**: Vehicle Owners can create Driver accounts linked to their profile (`employer` field).

### B. Booking Management

- **Creation**:
  - **Consumers**: Can book directly.
  - **Agents**: Can book on behalf of registered or **unregistered** users.
  - **Unregistered Support**: Generates a unique `trackingId` for public tracking links.
- **Workflow**:
  1.  **Pending**: Created by Consumer/Agent.
  2.  **Bidding**: Approved by Admin. Visible to Vehicle Owners.
  3.  **Assigned**: Bid accepted by Agent/Admin. Owner assigned.
  4.  **In-Transit/Delivered**: Status updated by Driver.
- **Visibility**:
  - Agents see only bookings they created.
  - Vehicle Owners see open bids and jobs they have won.

### C. Bidding System

- **Place Bid**: Vehicle Owners can bid on orders in the 'bidding' stage.
- **Accept Bid**: Agents/Admins can accept a bid, which automatically assigns the booking to the winning Vehicle Owner.

### D. Fleet Management

- **Vehicles**: Owners can add and manage their fleet.
- **Assignment**: Owners can assign specific Drivers and Vehicles to bookings they have won.

### E. Operations & Financials

- **Tracking**: Public endpoint for tracking shipments without login.
- **Notifications**: Automated alerts sent to customers when booking status changes.
- **Wallet**:
  - Tracks earnings.
  - **Automation**: Automatically credits the Vehicle Owner's wallet when a driver marks a shipment as `delivered`.
- **Reviews**: System for rating drivers/services.

## 4. API Endpoints Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/check-phone`

### Bookings

- `POST /api/bookings` (Create)
- `GET /api/bookings` (List - Role filtered)
- `PUT /api/bookings/:id/approve` (Admin)
- `POST /api/bookings/:id/bid` (Place Bid)
- `PUT /api/bookings/:id/bids/:bidId/accept` (Accept Bid)
- `PUT /api/bookings/:id/assign` (Assign Driver/Truck)
- `PUT /api/bookings/:id/status` (Update Status)
- `GET /api/bookings/track/:trackingId` (Public Track)

### Fleet

- `POST /api/vehicles`
- `POST /api/drivers`

### User Features

- `GET /api/notifications`
- `GET /api/wallet`
- `POST /api/reviews`

## 5. Next Steps

- **Integration**: Connect the React Native frontend to these endpoints.
- **Deployment**: Deploy the Node.js server to a cloud provider (AWS/Heroku/DigitalOcean).
- **Real-time**: Integrate Socket.io for live location updates (currently supported via API polling).
