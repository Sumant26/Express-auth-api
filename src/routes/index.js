import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';

const router = express.Router();

/**
 * Main Router
 * 
 * Best Practice:
 * Centralized route registration
 * All routes are prefixed with /api
 */

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router;

