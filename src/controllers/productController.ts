import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, price, description } = req.body;
  const product = new Product({
    name,
    price,
    description,
  });

  await product.save();
  return res.status(201).json(product);
};

export const getProducts = async (req: Request, res: Response) => {
  const products = await Product.find().populate('createdBy', 'name email');
  return res.json(products);
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  const product = await Product.findByIdAndUpdate(
    id,
    { name, price, description },
    { new: true }
  );

  if (!product) return res.status(404).json({ message: 'Product not found' });

  return res.json(product);
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);

  if (!product) return res.status(404).json({ message: 'Product not found' });

  return res.json({ message: 'Product deleted successfully' });
};
