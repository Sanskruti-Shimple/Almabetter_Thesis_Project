import { Router } from "express";
import Product from "../models/Product.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function createProductsRouter() {
  const router = Router();

  router.get("/", async (req, res, next) => {
    const filter = {};
    if (typeof req.query.category === "string" && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    if (typeof req.query.q === "string" && req.query.q.trim()) {
      const search = new RegExp(escapeRegex(req.query.q.trim().slice(0, 80)), "i");
      filter.$or = [{ name: search }, { description: search }, { category: search }];
    }

    try {
      const products = await Product.find(filter).sort({ featured: -1, name: 1 }).limit(100).lean();
      return res.json(products);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
