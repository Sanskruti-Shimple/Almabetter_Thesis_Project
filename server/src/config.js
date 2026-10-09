import dotenv from "dotenv";

dotenv.config();

export function getConfig(env = process.env) {
  const { MONGODB_URI, JWT_SECRET } = env;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  const clientOrigins = (env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (clientOrigins.length === 0) throw new Error("CLIENT_ORIGIN must include at least one origin");

  return {
    mongoUri: MONGODB_URI,
    jwtSecret: JWT_SECRET,
    clientOrigins,
    port
  };
}
