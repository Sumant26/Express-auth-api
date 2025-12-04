# Advanced Node.js Express API with MongoDB

A production-ready Node.js Express API with MongoDB integration, featuring advanced patterns, security best practices, and comprehensive error handling.

## 🚀 Features

### Core Features
- **Express.js** - Fast, unopinionated web framework
- **MongoDB with Mongoose** - Robust database integration
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and user roles
- **RESTful API** - Well-structured REST endpoints

### Advanced Features
- **Environment Configuration** - Centralized config management
- **Error Handling** - Global error handler with proper error classification
- **Input Validation** - Express-validator for request validation
- **Security Middleware** - Helmet, rate limiting, XSS protection, NoSQL injection prevention
- **Request Logging** - Morgan for HTTP request logging
- **Compression** - Response compression for better performance
- **Database Connection Pooling** - Optimized MongoDB connections
- **Pagination** - Built-in pagination support
- **Search Functionality** - Full-text search capabilities
- **Soft Deletes** - Logical deletion instead of physical deletion

## 📁 Project Structure

```
src/
├── config/
│   ├── config.js          # Application configuration
│   └── database.js        # MongoDB connection handler
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── productController.js # Product CRUD operations
├── middleware/
│   ├── auth.js            # Authentication & authorization
│   ├── errorHandler.js    # Global error handler
│   ├── security.js        # Security middleware
│   └── validation.js      # Input validation
├── models/
│   ├── User.js            # User schema with advanced features
│   └── Product.js         # Product schema with relationships
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── productRoutes.js   # Product routes
│   └── index.js           # Route aggregator
├── utils/
│   ├── AppError.js        # Custom error class
│   └── asyncHandler.js    # Async error handler wrapper
└── server.js              # Express app entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd express-mongodb-advanced
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/express-advanced
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   # Default: mongodb://localhost:27017
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Products
- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=term` - Search products
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Query Parameters (Products)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Filter in-stock items (true/false)
- `search` - Search term
- `sort` - Sort option (priceAsc, priceDesc, nameAsc, nameDesc, newest, oldest)

## 🔐 Advanced Concepts Explained

### 1. **MongoDB Connection Pooling**

```javascript
// In database.js
const options = {
  maxPoolSize: 10,        // Maximum connections
  minPoolSize: 2,         // Minimum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

**Why?** Connection pooling reuses database connections, reducing overhead and improving performance. Instead of creating a new connection for each request, connections are reused from a pool.

### 2. **Schema Design Best Practices**

**Indexes for Performance:**
```javascript
userSchema.index({ email: 1 }); // Single field index
productSchema.index({ category: 1, isActive: 1 }); // Compound index
productSchema.index({ name: 'text', description: 'text' }); // Text index
```

**Why?** Indexes dramatically speed up queries. Without indexes, MongoDB scans every document. With indexes, it can quickly locate documents.

**Virtual Fields:**
```javascript
userSchema.virtual('fullProfile').get(function () {
  return { id: this._id, name: this.name, email: this.email };
});
```

**Why?** Virtual fields are computed properties that don't exist in the database but can be accessed like regular fields. Useful for computed values.

### 3. **Pre/Post Hooks**

```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**Why?** Hooks allow you to execute code before or after certain operations. Here, we hash passwords automatically before saving, ensuring security without manual intervention.

### 4. **Error Handling Strategy**

**Custom Error Class:**
```javascript
class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

**Why?** Distinguishes between operational errors (expected, user-facing) and programming errors (bugs). Only operational errors are sent to clients in production.

**Global Error Handler:**
```javascript
app.use(errorHandler);
```

**Why?** Centralized error handling ensures consistent error responses and proper error logging. All errors flow through one place.

### 5. **Async Handler Wrapper**

```javascript
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

**Why?** Eliminates repetitive try-catch blocks. Automatically catches async errors and passes them to error middleware.

### 6. **Security Middleware Stack**

**Helmet:**
```javascript
app.use(helmet());
```
Sets various HTTP headers to secure your app (XSS protection, content security policy, etc.)

**Rate Limiting:**
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```
Prevents brute force attacks by limiting requests per IP.

**Data Sanitization:**
```javascript
app.use(mongoSanitize()); // Prevents NoSQL injection
app.use(xss()); // Prevents XSS attacks
```
Sanitizes user input to prevent injection attacks.

### 7. **JWT Authentication Flow**

1. User logs in → Server validates credentials
2. Server generates JWT token → Contains user ID and role
3. Token sent to client → Stored in cookie or localStorage
4. Client sends token with requests → In Authorization header
5. Server verifies token → Extracts user info
6. Request proceeds → With user context

**Why JWT?** Stateless authentication. Server doesn't need to store sessions. Token contains all necessary information.

### 8. **Middleware Chaining**

```javascript
router.post('/products', 
  protect,           // 1. Check authentication
  authorize('admin'), // 2. Check authorization
  validate,          // 3. Validate input
  createProduct      // 4. Execute controller
);
```

**Why?** Each middleware has a single responsibility. They chain together to build up request context and security.

### 9. **Pagination Pattern**

```javascript
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;
const skip = (page - 1) * limit;

const products = await Product.find(filter)
  .skip(skip)
  .limit(limit);
```

**Why?** Prevents loading all data at once. Only loads the requested page, improving performance and reducing memory usage.

### 10. **Soft Deletes**

```javascript
product.isActive = false; // Instead of product.remove()
```

**Why?** Preserves data for auditing, recovery, or analytics. Data is marked as inactive but not physically deleted.

## 🔒 Security Best Practices Implemented

1. **Password Hashing** - bcrypt with salt rounds
2. **JWT Tokens** - Secure token-based authentication
3. **Rate Limiting** - Prevents brute force attacks
4. **Input Validation** - Validates all user input
5. **Data Sanitization** - Prevents NoSQL injection and XSS
6. **Security Headers** - Helmet sets secure HTTP headers
7. **CORS** - Controlled cross-origin requests
8. **Environment Variables** - Sensitive data not in code
9. **Error Handling** - Doesn't leak sensitive information
10. **Cookie Security** - HttpOnly, Secure, SameSite flags

## 📊 Performance Optimizations

1. **Connection Pooling** - Reuses database connections
2. **Indexes** - Fast database queries
3. **Compression** - Reduces response size
4. **Pagination** - Limits data transfer
5. **Selective Field Loading** - Only loads needed fields
6. **Query Optimization** - Efficient MongoDB queries

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/express-advanced |
| `JWT_SECRET` | Secret for JWT tokens | (required in production) |
| `JWT_EXPIRE` | Token expiration time | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in minutes | 15 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🎯 Best Practices Summary

1. **Separation of Concerns** - Controllers, models, routes separated
2. **DRY Principle** - Reusable utilities and middleware
3. **Error Handling** - Comprehensive error handling strategy
4. **Security First** - Multiple layers of security
5. **Performance** - Optimized database queries and connections
6. **Code Organization** - Clear folder structure
7. **Documentation** - Well-commented code
8. **Environment Config** - Centralized configuration
9. **Validation** - Input validation on all endpoints
10. **Logging** - Request and error logging

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Node.js, Express, and MongoDB**

#   E x p r e s s - a u t h - a p i  
 