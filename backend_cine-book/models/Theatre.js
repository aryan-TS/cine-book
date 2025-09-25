import mongoose from "mongoose";

const screenSchema = new mongoose.Schema({
  screenNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
});

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: [screenSchema], // Array of screens with capacity
  },
  { timestamps: true }
);

const Theatre = mongoose.model("Theatre", theatreSchema);
export default Theatre;
