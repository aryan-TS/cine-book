import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String, // String for IMDB ID, not ObjectId
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screenNumber: {
      type: Number,
      required: true,
    },
    showtime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    // Local calendar date (YYYY-MM-DD) for reliable day filtering
    showDate: {
      type: String,
      index: true,
    },
    // Booked seat IDs like 'A1', 'B5'
    bookedSeats: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
