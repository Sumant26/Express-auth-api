# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your settings:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/express-advanced
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Get Products

```bash
curl http://localhost:3000/api/products
```

### 5. Create Product (Admin only)

First, update a user to admin role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { role: "admin" } }
)
```

Then create a product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": { "amount": 999.99, "currency": "USD" },
    "category": "electronics",
    "stock": 10,
    "sku": "LAP-001"
  }'
```

## Using Postman or Thunder Client

1. Import the following collection structure:

**Auth Endpoints:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (requires Bearer token)
- POST `/api/auth/logout` (requires Bearer token)

**Product Endpoints:**
- GET `/api/products`
- GET `/api/products/:id`
- GET `/api/products/search?q=term`
- POST `/api/products` (Admin, requires Bearer token)
- PATCH `/api/products/:id` (Admin, requires Bearer token)
- DELETE `/api/products/:id` (Admin, requires Bearer token)

2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (set after login)

3. For authenticated requests, add header:
   ```
   Authorization: Bearer {{token}}
   ```

## Common Issues

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, check IP whitelist and connection string

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
- Change `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
  ```

### JWT Token Invalid

**Error:** `Not authorized to access this route`

**Solution:**
- Make sure you're sending the token in the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`
- Token might be expired - login again

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the codebase to understand the architecture
- Check out the advanced features and best practices explained in the code comments
- Customize the models and routes for your needs

