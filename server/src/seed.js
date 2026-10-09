import { getConfig } from "./config.js";
import { connectDatabase } from "./db.js";
import Product from "./models/Product.js";
import mongoose from "mongoose";

const products = [
  {
    name: "Everyday Canvas Tote",
    description: "A sturdy, thoughtfully sized carryall for market mornings and daily errands.",
    category: "Accessories",
    price: 28,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    name: "Stoneware Morning Mug",
    description: "Hand-finished stoneware with a soft glaze and a comfortable rounded handle.",
    category: "Home",
    price: 24,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    name: "Weekend Linen Shirt",
    description: "Breathable, relaxed-fit linen made for unhurried days and warm afternoons.",
    category: "Apparel",
    price: 64,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    featured: true
  },
  {
    name: "Minimal Desk Lamp",
    description: "A clean-lined lamp that brings a gentle pool of light to your workspace.",
    category: "Home",
    price: 78,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    name: "Weekend Market Basket",
    description: "A woven basket with room for fresh finds, flowers, and picnic essentials.",
    category: "Accessories",
    price: 42,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    name: "Soft Cotton Throw",
    description: "A lightweight textured layer for the sofa, a reading nook, or travel.",
    category: "Home",
    price: 56,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    name: "Daily Carry Bottle",
    description: "A reusable insulated bottle with a considered silhouette and secure lid.",
    category: "Accessories",
    price: 32,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    featured: false
  },
  {
    name: "Classic Leather Wallet",
    description: "A compact everyday wallet with practical slots and a timeless profile.",
    category: "Accessories",
    price: 48,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    featured: false
  }
];

try {
  await connectDatabase(getConfig().mongoUri);
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} sample products.`);
  } else {
    console.log(`Catalog already contains ${count} products; no changes made.`);
  }
} catch (error) {
  console.error("Catalog seeding failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
