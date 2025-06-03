const express = require("express");
const app = express();
app.use(express.json());
app.use(require("cors")());

// --- API ROUTES ---
app.use("/api/profile", require("./src/routes/profile"));
app.use("/api/goals", require("./src/routes/goals"));
app.use("/api/rewards", require("./src/routes/rewards"));
app.use("/api/integrations", require("./src/routes/integrations"));
app.use("/api/carbon", require("./src/routes/carbon"));
app.use("/api/auth", require("./src/routes/auth"));

// Catch-all for unmatched /api/* endpoints to return JSON—not HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

/**
 * Express generic error handler (for backend bugs, exceptions)
 * If error occurs on API route, always send JSON error.
 */
app.use((err, req, res, next) => {
  // If this was an API call, always return JSON error
  if (req.path.startsWith("/api/")) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  } else {
    next(err);
  }
});

// Fallback: Serve frontend from React build (not API)
// (for demo, this may not exist, but in prod use build folder)
const path = require("path");
try {
  const buildPath = path.resolve(__dirname, "../build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} catch {}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`EcoTrack360 backend running on http://localhost:${PORT}`);
});
