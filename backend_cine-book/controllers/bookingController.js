import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';
import { sendBookingEmail } from '../services/emailService.js';  // ✅ Added missing import

// Create a booking after payment success
export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      movieId,
      movieTitle,
      showId,
      seats,
      totalAmount,
    } = req.body;

    console.log('🎫 Booking request received:', {
      userId,
      customerName,
      customerEmail,
      movieId,
      movieTitle,
      showId,
      seats,
      totalAmount
    });

    if (!movieId || !movieTitle || !showId || !seats?.length || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const show = await Show.findById(showId).populate('theatre');
    if (!show) return res.status(404).json({ message: 'Show not found' });

    console.log('🎬 Show found:', {
      showId: show._id,
      movie: show.movie,
      theatre: show.theatre,
      theatreName: show.theatre?.name,
      showtime: show.showtime
    });

    // ✅ Validate show timing
    const now = new Date();
    const showTime = new Date(show.showtime);

    if (showTime < now) {
      return res.status(400).json({ 
        message: 'Cannot book tickets for past shows. This showtime has already passed.',
        showtime: showTime,
        currentTime: now
      });
    }


    // ✅ Create booking without checking seat conflicts
    console.log('💾 Creating booking...');
    const booking = await Booking.create({
      user: userId || undefined,
      customerName: customerName || 'Customer',
      customerEmail,
      movieId,
      movieTitle,
      theatre: show.theatre?._id,
      theatreName: show.theatre?.name,
      show: show._id,
      showTime: show.showtime,
      seats: seats.map(String),
      totalAmount,
      status: 'confirmed',
    });
    console.log('✅ Booking created:', {
      bookingId: booking._id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      movieTitle: booking.movieTitle,
      theatreName: booking.theatreName
    });

    // ✅ Update seat availability without checking conflicts
    console.log('🔒 Marking seats as booked...');
    await Show.updateOne(
      { _id: show._id },
      { $addToSet: { bookedSeats: { $each: seats.map(String) } } }
    );
    console.log('✅ Seats marked as booked');

    // ✅ Send booking confirmation email
    try {
      console.log('📧 Sending booking confirmation email...');
      const emailData = {
        userEmail: booking.customerEmail,
        userName: booking.customerName,
        movieTitle: booking.movieTitle,
        showtime: booking.showTime,
        theatreName: booking.theatreName,
        seats: booking.seats.join(', '),
        totalAmount: booking.totalAmount,
        bookingId: booking._id
      };

      const emailResult = await sendBookingEmail(emailData);
      if (emailResult.success) {
        console.log('✅ Booking confirmation email sent successfully');
      } else {
        console.log('⚠️ Booking email failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Booking email error:', emailError);
    }

    res.status(201).json(booking);

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    res.status(500).json({ message: err.message });
  }
};

// List bookings (optionally filter by userId)
export const listBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error listing bookings:', err);
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all bookings without any filter
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('show')       
      .populate('theatre')    
      .sort({ createdAt: -1 }) 
      .lean();

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
