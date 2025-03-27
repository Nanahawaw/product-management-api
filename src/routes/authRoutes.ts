import express from 'express';
import { register, login, adminLogin } from '../controllers/authController';
const router = express.Router();

router.post('/register');
router.post('/login');
router.post('/admin/login');

export default router;
