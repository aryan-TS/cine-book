import express from "express";
import {
  getAllTheatres,
  addTheatre,
  updateTheatre,
  deleteTheatre,
} from "../controllers/theatreController.js";

const router = express.Router();

router.get("/", getAllTheatres);
router.post("/", addTheatre);
router.put("/:id", updateTheatre);
router.delete("/:id", deleteTheatre);

export default router;
