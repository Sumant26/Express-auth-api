import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * Product Routes
 * 
 * Best Practices:
 * 1. Public vs Private routes - Different access levels
 * 2. Role-based routes - Admin-only operations
 * 3. Nested routes - Organize related endpoints
 * 4. Validation - Validate input data
 */

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price.amount').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
      .isIn(['electronics', 'clothing', 'food', 'books', 'other'])
      .withMessage('Invalid category'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    validate,
  ],
  createProduct
);

router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

