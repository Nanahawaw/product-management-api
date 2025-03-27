import express from 'express';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { adminAuthGuard } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/');
router.post('/');
router.put('/:id');
router.delete('/:id');

export default router;
