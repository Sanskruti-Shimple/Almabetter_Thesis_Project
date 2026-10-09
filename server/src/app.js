import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createAuthMiddleware } from "./middleware/auth.js";
import { createAuthRouter } from "./routes/auth.js";
import { createOrdersRouter } from "./routes/orders.js";
import { createProductsRouter } from "./routes/products.js";

export function createApp(config) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use(
    "/api/auth",
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }),
    createAuthRouter(config.jwtSecret)
  );
  app.use("/api/products", createProductsRouter());
  app.use("/api/orders", createOrdersRouter(createAuthMiddleware(config.jwtSecret)));

  app.use((_req, res) => res.status(404).json({ error: "Resource not found." }));
  app.use((error, _req, res, _next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Request body must be valid JSON." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "The request contains invalid data." });
    }
    console.error(error);
    return res.status(500).json({ error: "An unexpected server error occurred." });
  });

  return app;
}
