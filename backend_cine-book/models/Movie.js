import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    imdbID: {
      type: String,
      required: true,
      unique: true,
    },
    languages: {
      type: [String], // array of languages
      required: true,
    },
    certificate: {
      type: String,
      required: true,
    },
    priceRange: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;