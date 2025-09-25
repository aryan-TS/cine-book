import dotenv from "dotenv";
import app from "./app.js";

// Load env for local dev
dotenv.config();

// Local development server only
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
