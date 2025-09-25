import Theatre from "../models/Theatre.js";

// Get all theatres
export const getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ message: "Error fetching theatres", error: err.message });
  }
};

// Add a new theatre
export const addTheatre = async (req, res) => {
  try {
    const { name, location, screens } = req.body;

    if (!name || !location || !screens) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTheatre = new Theatre({ name, location, screens });
    await newTheatre.save();

    res.status(201).json({ message: "Theatre added successfully", theatre: newTheatre });
  } catch (err) {
    res.status(500).json({ message: "Error adding theatre", error: err.message });
  }
};

// Update theatre
export const updateTheatre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, screens } = req.body;

    const updatedTheatre = await Theatre.findByIdAndUpdate(
      id,
      { name, location, screens },
      { new: true }
    );

    if (!updatedTheatre) return res.status(404).json({ message: "Theatre not found" });

    res.json({ message: "Theatre updated successfully", theatre: updatedTheatre });
  } catch (err) {
    res.status(500).json({ message: "Error updating theatre", error: err.message });
  }
};

// Delete theatre
export const deleteTheatre = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTheatre = await Theatre.findByIdAndDelete(id);

    if (!deletedTheatre) return res.status(404).json({ message: "Theatre not found" });

    res.json({ message: "Theatre deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting theatre", error: err.message });
  }
};
