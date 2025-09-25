import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

// Load env (Vercel sets env via dashboard; dotenv is safe for local dev)
dotenv.config();

// Models used during bootstrap
import Admin from "./models/Admin.js";

// Routes
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import movieRoutes from "./routes/movieRoutes.js";
import theatreRoutes from "./routes/theatreRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// Cache the DB connection across serverless invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, didInit: false };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;

  // One-time bootstrap: create default admin
  if (!cached.didInit) {
    try {
      const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
      if (!existingAdmin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const newAdmin = new Admin({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD, // hashed by pre-save hook
        });
        await newAdmin.save();
        console.log(`Default admin created: ${process.env.ADMIN_EMAIL}`);
      }
      cached.didInit = true;
    } catch (e) {
      console.error("Error during admin bootstrap:", e);
    }
  }

  return cached.conn;
}

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// Register routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get(["/", "/api", "/api/health"], (req, res) => {
  res.json({ status: "ok" });
});

export default app;
