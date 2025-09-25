import Movie from "../models/Movie.js";

/**
 * @desc   Add a new movie
 * @route  POST /api/movies
 */
export const addMovie = async (req, res) => {
  try {
    const { imdbID, languages, certificate, priceRange, releaseDate } = req.body;

    if (!imdbID || !languages || !certificate || !priceRange || !releaseDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingMovie = await Movie.findOne({ imdbID });
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already exists" });
    }

    const movie = new Movie({
      imdbID,
      languages,
      certificate,
      priceRange,
      releaseDate,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Get all movies
 * @route  GET /api/movies
 */
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    let movie;

    // Check if it's a valid ObjectId (24 character hex string)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      // It's a valid ObjectId, search by _id
      movie = await Movie.findById(id);
    } else {
      // It's not a valid ObjectId, so it's likely an imdbID
      movie = await Movie.findOne({ imdbID: id });
    }

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Update movie
 * @route  PUT /api/movies/:id
 */
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc   Delete movie
 * @route  DELETE /api/movies/:id
 */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted" });
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ message: "Server error" });
  }
};
