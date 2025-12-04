import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Product Controller
 * 
 * Best Practices:
 * 1. CRUD operations - Complete CRUD functionality
 * 2. Pagination - Handle large datasets
 * 3. Filtering - Advanced filtering options
 * 4. Sorting - Flexible sorting
 * 5. Search - Full-text search capability
 */

/**
 * Advanced query building helper
 */
const buildQuery = (query) => {
  const { category, minPrice, maxPrice, inStock, search, sort } = query;

  let filter = { isActive: true };

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter['price.amount'] = {};
    if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
  }

  // Stock filter
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Sort options
  let sortOption = '-createdAt'; // Default: newest first
  if (sort) {
    const sortFields = {
      priceAsc: 'price.amount',
      priceDesc: '-price.amount',
      nameAsc: 'name',
      nameDesc: '-name',
      newest: '-createdAt',
      oldest: 'createdAt',
    };
    sortOption = sortFields[sort] || sortOption;
  }

  return { filter, sortOption };
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { filter, sortOption } = buildQuery(req.query);

  const products = await Product.find(filter)
    .populate('createdBy', 'name email')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  res.status(StatusCodes.OK).json({
    status: 'success',
    results: products.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      products,
    },
  });
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', StatusCodes.NOT_FOUND));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private (Admin only)
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', StatusCodes.NOT_FOUND));
  }

  Object.assign(product, req.body);
  await product.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', StatusCodes.NOT_FOUND));
  }

  // Soft delete - set isActive to false
  product.isActive = false;
  await product.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Product deleted successfully',
  });
});

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Search query is required',
    });
  }

  const products = await Product.searchProducts(q);

  res.status(StatusCodes.OK).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

