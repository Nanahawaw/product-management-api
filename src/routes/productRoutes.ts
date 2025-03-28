import express from 'express';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/productController';
import { adminAuthGuard } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.post('/', adminAuthGuard, createProduct);
router.put('/:id', adminAuthGuard, updateProduct);
router.delete('/:id', adminAuthGuard, deleteProduct);
router.get('/:id', getProductById);

export default router;
