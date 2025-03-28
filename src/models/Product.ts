import { Schema, model } from 'mongoose';

export interface IProduct {
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be lower than 0.'],
    },
  },
  { timestamps: true }
);

export const ProductModel = model('Product', ProductSchema);
