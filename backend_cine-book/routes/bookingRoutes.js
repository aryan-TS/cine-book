import express from 'express';
import { createBooking, listBookings,getAllBookings } from '../controllers/bookingController.js';

const router = express.Router();

// GET /api/bookings?userId=...
router.get('/', listBookings);

// POST /api/bookings
router.post('/', createBooking);
router.get('/all', getAllBookings);
export default router;
