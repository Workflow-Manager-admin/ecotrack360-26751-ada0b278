import express from "express";
import { mockDB } from "../db/mockdb.js";
const router = express.Router();

const AVAILABLE_INTEGRATIONS = [
  { key: "banking", label: "Banking" },
  { key: "maps", label: "Maps" },
  { key: "energy", label: "Energy" },
];

// PUBLIC_INTERFACE
// GET /api/integrations (list user's integrations)
router.get("/", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user.integrations || {});
});

// PUBLIC_INTERFACE
// POST /api/integrations/connect/:key
router.post("/connect/:key", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const key = req.params.key;
  user.integrations = user.integrations || {};
  if (!AVAILABLE_INTEGRATIONS.some(i => i.key === key))
    return res.status(400).json({ error: "Unknown integration" });
  user.integrations[key] = true;
  res.json({ success: true });
});

// PUBLIC_INTERFACE
// POST /api/integrations/disconnect/:key
router.post("/disconnect/:key", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const key = req.params.key;
  user.integrations = user.integrations || {};
  user.integrations[key] = false;
  res.json({ success: true });
});

// PUBLIC_INTERFACE
// GET /api/integrations/data (returns mock imported data for connected integrations)
router.get("/data", (req, res) => {
  const user = mockDB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  // This would aggregate imported records based on connection status, here just static
  res.json({
    banking: user.integrations?.banking ? [{ item: "SuperMart groceries", co2: "0.11 tCO2" }] : [],
    maps: user.integrations?.maps ? [{ item: "Car trip (12mi)", co2: "0.02 tCO2" }] : [],
    energy: user.integrations?.energy ? [{ item: "Electric bill", co2: "0.17 tCO2" }] : [],
  });
});

export default router;
