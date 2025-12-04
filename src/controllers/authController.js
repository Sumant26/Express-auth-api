import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Authentication Controller
 * 
 * Best Practices:
 * 1. Separation of concerns - Business logic in controllers
 * 2. Error handling - Use AppError for consistent errors
 * 3. Status codes - Use http-status-codes library
 * 4. Async handling - Use asyncHandler wrapper
 * 5. Response formatting - Consistent response structure
 */

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User already exists with this email', StatusCodes.BAD_REQUEST));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  const token = user.generateToken();

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.cookie('token', token, cookieOptions);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', StatusCodes.BAD_REQUEST));
  }

  // Find user and include password field
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is inactive', StatusCodes.UNAUTHORIZED));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = user.generateToken();

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.cookie('token', token, cookieOptions);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

