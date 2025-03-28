import { Request, Response } from 'express';
import { IProduct, ProductModel } from '../models/Product';

export const createProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, price, description, quantity } = req.body;

    // Check if a product with the same name already exists
    const existingProduct = await ProductModel.findOne({ name });

    if (existingProduct) {
      return res.status(400).json({
        message: 'Product name already exists',
      });
    }

    // If no duplicate, create the new product
    const product = new ProductModel({
      name,
      price,
      description,
      quantity,
    });

    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      message: 'Error creating product',
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const products = await ProductModel.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get product by ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, price, description, quantity } = req.body;
  const product = await ProductModel.findByIdAndUpdate(
    id,
    { name, price, description, quantity },
    { new: true }
  );

  if (!product) return res.status(404).json({ message: 'Product not found' });

  return res.json(product);
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const product = await ProductModel.findByIdAndDelete(id);

  if (!product) return res.status(404).json({ message: 'Product not found' });

  return res.json({ message: 'Product deleted successfully' });
};
