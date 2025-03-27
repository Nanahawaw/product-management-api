import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);
