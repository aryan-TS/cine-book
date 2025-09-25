import Review from "../models/Review.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import { sendReviewNotificationEmail } from "../services/emailService.js";

/**
 * @desc   Add a new review
 * @route  POST /api/reviews
 */
export const addReview = async (req, res) => {
  try {
    const { movieId, userId, rating, comment } = req.body;

    console.log("Review submission received:", {
      movieId,
      userId,
      rating,
      comment: comment?.substring(0, 50) + "...",
    });

    if (!movieId || !userId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if movieId is a valid ObjectId, if not, find movie by imdbID first
    let actualMovieId = movieId;
    let movie;

    // Check if it's a valid ObjectId (24 character hex string)
    if (!/^[0-9a-fA-F]{24}$/.test(movieId)) {
      // It's not a valid ObjectId, so it's likely an imdbID
      movie = await Movie.findOne({ imdbID: movieId });
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      actualMovieId = movie._id;
    } else {
      // Check if movie exists by ObjectId
      movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
    }

    // Check if user exists - handle both ObjectId and string userId
    let user;
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      // It's a valid ObjectId
      user = await User.findById(userId);
    } else {
      // It's not a valid ObjectId, try to find by email
      console.log("Looking for user by email:", userId);
      user = await User.findOne({ email: userId });
      if (!user) {
        console.log("User not found with email:", userId);
        return res
          .status(404)
          .json({ message: "User not found. Please log in first." });
      }
      console.log("User found:", user.fullName, user.email);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      movieId: actualMovieId,
      userId: user._id,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this movie" });
    }

    const review = new Review({
      movieId: actualMovieId,
      userId: user._id,
      rating,
      comment,
    });

    console.log("Saving review:", {
      movieId: actualMovieId,
      userId: user._id,
      rating,
      comment: comment.substring(0, 50) + "...",
    });
    await review.save();
    console.log("Review saved successfully with ID:", review._id);

    // Populate user details for response
    await review.populate("userId", "fullName email");
    console.log("Populated user:", review.userId);

    // Transform the response to match frontend expectations
    const reviewResponse = review.toObject();
    reviewResponse.user = reviewResponse.userId;
    delete reviewResponse.userId;
    console.log("Sending response with user:", reviewResponse.user);

    // Send review notification email (optional)
    try {
      const emailData = {
        userEmail: user.email,
        userName: user.fullName,
        movieTitle: movie.title,
        rating: rating,
        comment: comment,
      };

      const emailResult = await sendReviewNotificationEmail(emailData);
      if (emailResult.success) {
        console.log("Review notification email sent successfully");
      } else {
        console.log(
          "Failed to send review notification email:",
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error("Error sending review notification email:", emailError);
      // Don't fail the review if email fails
    }

    res.status(201).json(reviewResponse);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Get reviews for a specific movie
 * @route  GET /api/reviews/movie/:movieId
 */
export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if movieId is a valid ObjectId, if not, find movie by imdbID first
    let actualMovieId = movieId;

    // Check if it's a valid ObjectId (24 character hex string)
    if (!/^[0-9a-fA-F]{24}$/.test(movieId)) {
      // It's not a valid ObjectId, so it's likely an imdbID
      const movie = await Movie.findOne({ imdbID: movieId });
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      actualMovieId = movie._id;
    }

    const reviews = await Review.find({ movieId: actualMovieId })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ movieId: actualMovieId });

    // Transform reviews to match frontend expectations
    const transformedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();
      reviewObj.user = reviewObj.userId;
      delete reviewObj.userId;
      return reviewObj;
    });

    res.json({
      reviews: transformedReviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Get all reviews
 * @route  GET /api/reviews
 */
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find()
      .populate("userId", "fullName email")
      .populate("movieId", "imdbID")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments();

    // Transform reviews to match frontend expectations
    const transformedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();
      reviewObj.user = reviewObj.userId;
      delete reviewObj.userId;
      return reviewObj;
    });

    res.json({
      reviews: transformedReviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Update a review
 * @route  PUT /api/reviews/:id
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true }
    ).populate("userId", "fullName email");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Transform the response to match frontend expectations
    const reviewResponse = review.toObject();
    reviewResponse.user = reviewResponse.userId;
    delete reviewResponse.userId;

    res.json(reviewResponse);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Delete a review
 * @route  DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Mark review as helpful
 * @route  POST /api/reviews/:id/helpful
 */
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate("userId", "fullName email");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Transform the response to match frontend expectations
    const reviewResponse = review.toObject();
    reviewResponse.user = reviewResponse.userId;
    delete reviewResponse.userId;

    res.json(reviewResponse);
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({ message: "Server error" });
  }
};
