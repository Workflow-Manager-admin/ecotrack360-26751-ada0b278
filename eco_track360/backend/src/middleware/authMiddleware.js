import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET || "changeme-eco-track360";

// PUBLIC_INTERFACE
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ error: "No token provided" });
  }
}
