import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String },

    movieId: { type: String, required: true }, // imdbID
    movieTitle: { type: String, required: true },

    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
    theatreName: { type: String },

    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    showTime: { type: Date, required: true },

    seats: { type: [String], required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed' },

    bookingDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
