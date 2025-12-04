import mongoose from 'mongoose';

/**
 * Product Model - Example of Advanced Schema Design
 * 
 * Best Practices:
 * 1. Nested schemas - For complex objects
 * 2. Enums - For controlled values
 * 3. Custom validators - Complex validation logic
 * 4. Text search indexes - For search functionality
 * 5. References - Relationships between collections
 */

const priceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP'],
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: 'text', // Text index for search
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: priceSchema,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'clothing', 'food', 'books', 'other'],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'],
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5; // Maximum 5 images
        },
        message: 'Cannot have more than 5 images',
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Compound Indexes
 * For efficient queries on multiple fields
 */
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'price.amount': 1 });
productSchema.index({ createdAt: -1 }); // Descending for recent products

/**
 * Text Index for Search
 * Enables full-text search across name and description
 */
productSchema.index({ name: 'text', description: 'text' });

/**
 * Virtual Fields
 */
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('formattedPrice').get(function () {
  return `${this.price.currency} ${this.price.amount.toFixed(2)}`;
});

/**
 * Instance Methods
 */
productSchema.methods.updateStock = function (quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Insufficient stock');
  }
  this.stock += quantity;
  return this.save();
};

productSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

/**
 * Static Methods
 */
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true });
};

productSchema.statics.searchProducts = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  });
};

productSchema.statics.findLowStock = function (threshold = 10) {
  return this.find({
    stock: { $lte: threshold },
    isActive: true,
  });
};

const Product = mongoose.model('Product', productSchema);

export default Product;

