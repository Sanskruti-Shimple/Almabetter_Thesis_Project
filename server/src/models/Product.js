import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ category: 1, name: 1 });

export default mongoose.model("Product", productSchema);
