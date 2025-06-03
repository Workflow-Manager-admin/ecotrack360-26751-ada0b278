import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import profileRoutes from "./src/routes/profile.js";
import goalsRoutes from "./src/routes/goals.js";
import rewardsRoutes from "./src/routes/rewards.js";
import integrationsRoutes from "./src/routes/integrations.js";
import carbonRoutes from "./src/routes/carbon.js";
import { authenticateJWT } from "./src/middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// All following routes require authentication
app.use("/api/profile", authenticateJWT, profileRoutes);
app.use("/api/goals", authenticateJWT, goalsRoutes);
app.use("/api/rewards", authenticateJWT, rewardsRoutes);
app.use("/api/integrations", authenticateJWT, integrationsRoutes);
app.use("/api/carbon", authenticateJWT, carbonRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({ status: "EcoTrack360 backend up" });
});

// Error fallback
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || "Internal error" });
});

app.listen(PORT, () => {
  console.log(`EcoTrack360 backend listening on port ${PORT}`);
});
