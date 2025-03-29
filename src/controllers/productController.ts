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
      message: error.message,
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let query = ProductModel.find();

    // Filtering
    const filter: any = {};

    // Add potential filters
    if (req.query.minPrice)
      filter.price = { $gte: parseFloat(req.query.minPrice as string) };
    if (req.query.maxPrice) {
      filter.price = {
        ...filter.price,
        $lte: parseFloat(req.query.maxPrice as string),
      };
    }
    if (req.query.inStock === 'true') filter.inStock = true;

    query = query.find(filter);

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });

    // Apply pagination
    query = query.skip(skip).limit(limit);

    // Execute query
    const products = await query.lean();

    // Get total count for pagination metadata
    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: (error as Error).message,
    });
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
