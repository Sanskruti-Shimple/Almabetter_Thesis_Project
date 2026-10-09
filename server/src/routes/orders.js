import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export function createOrdersRouter(requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.post("/", async (req, res, next) => {
    const requested = req.body.items;
    if (!Array.isArray(requested) || requested.length < 1 || requested.length > 50) {
      return res.status(400).json({ error: "An order must contain between 1 and 50 items." });
    }

    const quantities = new Map();
    for (const item of requested) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return res.status(400).json({ error: "Each item needs a valid product ID and quantity from 1 to 99." });
      }
      const quantity = (quantities.get(item.productId) || 0) + item.quantity;
      if (quantity > 99) {
        return res.status(400).json({ error: "The total quantity for a product cannot exceed 99." });
      }
      quantities.set(item.productId, quantity);
    }

    try {
      const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean();
      if (products.length !== quantities.size) {
        return res.status(400).json({ error: "One or more products are no longer available." });
      }

      const items = products.map((product) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantities.get(String(product._id))
      }));
      const total = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
      const order = await Order.create({ user: req.user._id, items, total });
      return res.status(201).json(order);
    } catch (error) {
      return next(error);
    }
  });

  router.get("/mine", async (req, res, next) => {
    try {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
      return res.json(orders);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
