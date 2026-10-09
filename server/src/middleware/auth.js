import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function createAuthMiddleware(jwtSecret) {
  return async function requireAuth(req, res, next) {
    const token = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Sign in to continue." });

    try {
      const payload = jwt.verify(token, jwtSecret);
      const user = await User.findById(payload.sub).select("name email");
      if (!user) return res.status(401).json({ error: "Your session is no longer valid." });
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Your session is invalid or has expired." });
      }
      next(error);
    }
  };
}
