import express from "express";
import {
  addReview,
  getMovieReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";

const router = express.Router();

// Add a new review
router.post("/", addReview);

// Get reviews for a specific movie
router.get("/movie/:movieId", getMovieReviews);

// Get all reviews (with pagination)
router.get("/", getAllReviews);

// Update a review
router.put("/:id", updateReview);

// Delete a review
router.delete("/:id", deleteReview);

// Mark review as helpful
router.post("/:id/helpful", markHelpful);

export default router;

