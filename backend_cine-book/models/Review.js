import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

// Ensure one review per user per movie
reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;

