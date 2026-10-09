import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user, jwtSecret) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "2h" });
}

export function createAuthRouter(jwtSecret) {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!name || name.length > 80 || !emailPattern.test(email) || password.length < 8 || password.length > 72) {
      return res.status(400).json({
        error: "Provide a name, a valid email, and a password of 8–72 characters."
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });
      return res.status(201).json({
        token: issueToken(user, jwtSecret),
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ error: "An account with that email already exists." });
      return next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!emailPattern.test(email) || !password) {
      return res.status(400).json({ error: "Enter a valid email and password." });
    }

    try {
      const user = await User.findOne({ email }).select("+passwordHash");
      const valid = user && await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Email or password is incorrect." });
      return res.json({
        token: issueToken(user, jwtSecret),
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
