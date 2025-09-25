import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";

// Get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("theatre");
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shows", error: err.message });
  }
};

// Get showtimes for a specific movie and date
export const getShowtimes = async (req, res) => {
  const { movieId, date } = req.query;

  

  if (!movieId || !date) {
    return res.status(400).json({ message: "movieId and date are required" });
  }

  try {
  // Normalize date string
  const normalizedDate = String(date);
  // Also compute local day bounds for backward compatibility
  const [y, m, d] = normalizedDate.split('-').map(Number);
  const startOfDay = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  const endOfDay = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);

    // Allow matching by imdbID (preferred) and legacy Movie _id string if any
    const allowedMovieIds = [movieId];
    try {
      const movieDoc = await Movie.findOne({ imdbID: movieId }).select('_id');
      if (movieDoc?._id) {
        allowedMovieIds.push(String(movieDoc._id));
      }
    } catch (e) {
      // non-fatal
    }

    // Find shows for this movie and date range
    const shows = await Show.find({
      movie: { $in: allowedMovieIds },
      $or: [
        { showDate: normalizedDate },
        { showtime: { $gte: startOfDay, $lte: endOfDay } }
      ]
    })
      .populate("theatre", "name location screens")
      .sort({ showtime: 1 });

    

    if (shows.length === 0) {
      return res.json([]);
    }

    // Group shows by theatre
    const grouped = {};
    shows.forEach((show) => {
      if (!show.theatre) return; // safety in case theatre was deleted
      const theatreId = show.theatre._id.toString();
      const theatreName = show.theatre.name;
      
      if (!grouped[theatreId]) {
        grouped[theatreId] = {
          theatre: {
            id: show.theatre._id,
            name: theatreName,
            location: show.theatre.location
          },
          showtimes: []
        };
      }
      
      grouped[theatreId].showtimes.push({
        id: show._id,
        screenNumber: show.screenNumber,
        showtime: show.showtime,
        time: show.showtime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        price: show.price,
        available: show.available !== undefined ? show.available : true,
        date: show.showtime.toISOString().split('T')[0],
        seatCapacity: show.theatre?.screens?.find?.(s => s.screenNumber === show.screenNumber)?.capacity || undefined
      });
    });

    // Convert grouped object to array
    const result = Object.values(grouped);

    
    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching showtimes:', err);
    res.status(500).json({ message: "Error fetching showtimes", error: err.message });
  }
};

// Add a show
export const addShow = async (req, res) => {
  try {
    const { movie, theatre, screenNumber, showtime, price } = req.body;

    // Normalize movie identifier to imdbID string
    let movieImdbId = movie;
    try {
      if (typeof movie === 'string' && movie.startsWith('tt')) {
        // Already imdbID
        const movieExists = await Movie.findOne({ imdbID: movie });
        if (!movieExists) return res.status(404).json({ message: "Movie not found" });
      } else if (typeof movie === 'string') {
        // Possibly a MongoDB ObjectId string from admin UI, convert to imdbID
        const movieDoc = await Movie.findById(movie);
        if (!movieDoc) return res.status(404).json({ message: "Movie not found" });
        movieImdbId = movieDoc.imdbID;
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid movie reference" });
    }

    // Validate theatre exists
    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) return res.status(404).json({ message: "Theatre not found" });

    // Validate screenNumber
    const screen = theatreExists.screens.find((s) => s.screenNumber === screenNumber);
    if (!screen) return res.status(400).json({ message: "Invalid screen number for this theatre" });

    const showDateLocal = (() => {
      const dt = new Date(showtime);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();

    const newShow = new Show({
      movie: movieImdbId,
      theatre,
      screenNumber,
      showtime: new Date(showtime),
      price,
      showDate: showDateLocal
    });
    await newShow.save();

    res.status(201).json({ message: "Show added successfully", show: newShow });
  } catch (err) {
    res.status(500).json({ message: "Error adding show", error: err.message });
  }
};

// Update a show
export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { movie, theatre, screenNumber, showtime, price } = req.body;

    // Normalize movie to imdbID if provided
    let normalizedMovie = movie;
    if (typeof movie === 'string' && movie && !movie.startsWith('tt')) {
      try {
        const movieDoc = await Movie.findById(movie);
        if (movieDoc) normalizedMovie = movieDoc.imdbID;
      } catch (e) {
        // ignore
      }
    }

    let updateDoc = { movie: normalizedMovie, theatre, screenNumber, price };
    if (showtime) {
      const dt = new Date(showtime);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      updateDoc.showtime = dt;
      updateDoc.showDate = `${y}-${m}-${d}`;
    }

    const updatedShow = await Show.findByIdAndUpdate(
      id,
      updateDoc,
      { new: true }
    );

    if (!updatedShow) return res.status(404).json({ message: "Show not found" });

    res.json({ message: "Show updated successfully", show: updatedShow });
  } catch (err) {
    res.status(500).json({ message: "Error updating show", error: err.message });
  }
};

// Delete a show
export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShow = await Show.findByIdAndDelete(id);

    if (!deletedShow) return res.status(404).json({ message: "Show not found" });

    res.json({ message: "Show deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting show", error: err.message });
  }
};

// Maintenance: Backfill showDate for existing documents
export const backfillShowDates = async (_req, res) => {
  try {
    const shows = await Show.find({ $or: [{ showDate: { $exists: false } }, { showDate: null }] });
    let updated = 0;
    for (const s of shows) {
      if (!s.showtime) continue;
      const dt = new Date(s.showtime);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      s.showDate = `${y}-${m}-${d}`;
      await s.save();
      updated++;
    }
    res.json({ message: 'Backfill complete', updated });
  } catch (err) {
    console.error('Backfill error:', err);
    res.status(500).json({ message: 'Backfill failed', error: err.message });
  }
};

// Seats API: get booked seats for a show
export const getBookedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const show = await Show.findById(showId).populate('theatre');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    const seatCapacity = show.theatre?.screens?.find?.(s => s.screenNumber === show.screenNumber)?.capacity;
    res.json({ bookedSeats: show.bookedSeats || [], seatCapacity });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booked seats', error: err.message });
  }
};

// Seats API: book seats (atomic upsert)
export const bookSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body; // array of seat IDs
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'No seats provided' });
    }

    // Use atomic operation to avoid race conditions
    const updated = await Show.findOneAndUpdate(
      { _id: showId, bookedSeats: { $nin: seats } },
      { $addToSet: { bookedSeats: { $each: seats } } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ message: 'One or more seats already booked' });
    }

    res.json({ message: 'Seats booked', bookedSeats: updated.bookedSeats });
  } catch (err) {
    res.status(500).json({ message: 'Error booking seats', error: err.message });
  }
};
