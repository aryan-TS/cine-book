import express from "express";
import {
  getAllShows,
  addShow,
  updateShow,
  deleteShow,
  getShowtimes,
  backfillShowDates,
  getBookedSeats,
  bookSeats,
} from "../controllers/showController.js";

const router = express.Router();

router.get("/", getAllShows);
router.post("/", addShow);
router.put("/:id", updateShow);
router.delete("/:id", deleteShow);
router.get("/showtimes", getShowtimes);
router.post("/maintenance/backfill-show-dates", backfillShowDates);
router.get('/:showId/seats', getBookedSeats);
router.post('/:showId/seats', bookSeats);

export default router;
