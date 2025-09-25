import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

// Load env
dotenv.config();

// Models
import Admin from "./models/Admin.js";

// Routes
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js"; // your existing user route
import movieRoutes from "./routes/movieRoutes.js";
import theatreRoutes from "./routes/theatreRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// App setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route registration
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Connect to DB and create default admin
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");

    // Auto-create default admin
    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (!existingAdmin) {
      const newAdmin = new Admin({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // gets hashed by pre-save
      });

      await newAdmin.save();
      console.log(`Default admin created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log(`Admin already exists: ${existingAdmin.email}`);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
