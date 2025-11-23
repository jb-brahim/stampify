# Stampify Backend API

A digital QR-based stamp card system backend for small businesses. Built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **Business Owner Authentication**: Secure signup and login with JWT tokens
- **Admin Panel**: Super-admin role with full system management capabilities
- **Stamp Card Management**: Create and customize stamp cards with rewards
- **QR Code Generation**: Unique QR codes for each business
- **Customer Scanning**: Automatic customer creation on first scan
- **Subscription Management**: Admin can suspend/renew business subscriptions
- **Rate Limiting**: Prevents abuse (1 stamp per 10 seconds per customer)
- **Security**: Password encryption with bcrypt, JWT authentication, CORS support

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stampify-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/stampify
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ADMIN_EMAIL=brahim@stampify.com
   ADMIN_PASSWORD=stampifyadmin*
   ```
   
   **For MongoDB Atlas (Cloud)**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stampify?retryWrites=true&w=majority
   ```

4. **Create Admin User**
   ```bash
   npm run seed:admin
   ```
   
   This creates the first admin user. Default credentials:
   - Email: `brahim@stampify.com` (or `ADMIN_EMAIL` from `.env`)
   - Password: `stampifyadmin*` (or `ADMIN_PASSWORD` from `.env`)
   
   ⚠️ **Important**: Change the default password after first login!

5. **Start MongoDB** (if using local MongoDB)
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

6. **Run the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### Signup Business Owner
- **POST** `/api/auth/signup`
- **Body**:
  ```json
  {
    "email": "business@example.com",
    "password": "password123",
    "businessName": "My Coffee Shop"
  }
  ```
- **Response**: Returns JWT token and business owner data

#### Login Business Owner
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "business@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns JWT token and business owner data

### Stamp Card Management

#### Get My Stamp Card
- **GET** `/api/card/my`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns current stamp card settings

#### Update Stamp Card
- **PUT** `/api/card/update`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "totalStamps": 10,
    "rewardText": "Free Coffee"
  }
  ```
- **Response**: Returns updated stamp card settings

### QR Code

#### Get My QR Code
- **GET** `/api/qr/my`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns base64 encoded QR code image and QR token

### Customer Scanning

#### Scan QR Code
- **POST** `/api/scan/:qrToken`
- **Body**:
  ```json
  {
    "deviceId": "unique-device-id-123"
  }
  ```
- **Response**: Returns updated stamp count and progress
- **Note**: Public endpoint, no authentication required
- **Rate Limit**: 1 request per 10 seconds per IP

### Customer Card

#### Get Customer Card
- **GET** `/api/customer/:customerId`
- **Response**: Returns customer's stamp card information
- **Note**: Public endpoint, no authentication required

### Admin Endpoints

#### Admin Login
- **POST** `/api/admin/login`
- **Body**:
  ```json
  {
    "email": "admin@stampify.com",
    "password": "admin123456"
  }
  ```
- **Response**: Returns JWT token with admin role

#### Get All Businesses
- **GET** `/api/admin/businesses`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: Returns all business owners with customer counts

#### Get Business Customers
- **GET** `/api/admin/businesses/:businessId/customers`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: Returns all customers for a specific business

#### Update Business Subscription
- **PATCH** `/api/admin/businesses/:businessId/subscription`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Body**:
  ```json
  {
    "subscriptionStatus": "suspended",
    "subscriptionExpiry": "2024-12-31T23:59:59.000Z"
  }
  ```
- **Response**: Returns updated business subscription info

#### Get Admin Statistics
- **GET** `/api/admin/stats`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: Returns dashboard statistics (total businesses, customers, stamp activity)

### Health Check

#### Check API Status
- **GET** `/health`
- **Response**: Returns API status and timestamp

## 🔐 Authentication

### Business Owner Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Admin Authentication

Admin endpoints require a separate admin login that returns a JWT token with the `role: "admin"` claim. The `adminAuth` middleware verifies both the token validity and the admin role.

**Important**: Business owner tokens cannot access admin routes, and admin tokens use the same Authorization header format. Admin tokens expire after 24 hours (business owner tokens expire after 7 days).

## 📦 Database Models

### BusinessOwner
- `email` (String, unique, required)
- `password` (String, hashed with bcrypt)
- `businessName` (String, required)
- `qrToken` (String, unique, auto-generated UUID)
- `stampCard` (Object):
  - `totalStamps` (Number, default: 10)
  - `rewardText` (String, default: "Free Reward")
- `subscriptionStatus` (String, enum: ['active', 'suspended'], default: 'active')
- `subscriptionExpiry` (Date, optional)
- `createdAt`, `updatedAt` (auto-generated timestamps)

### AdminUser
- `email` (String, unique, required)
- `password` (String, hashed with bcrypt)
- `role` (String, default: 'admin', enum: ['admin'])
- `createdAt`, `updatedAt` (auto-generated timestamps)

### Customer
- `businessId` (ObjectId, reference to BusinessOwner)
- `deviceId` (String, unique per business)
- `stamps` (Number, default: 0)
- `rewardAchieved` (Boolean, default: false)
- `lastStampTime` (Date, tracks last scan for rate limiting)
- `createdAt`, `updatedAt` (auto-generated timestamps)

## 🔒 Security Features

- **Password Encryption**: Uses bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 
  - Scan endpoint: 1 request per 10 seconds
  - General API: 100 requests per 15 minutes
- **Input Validation**: Express-validator for request validation
- **CORS**: Enabled for frontend integration
- **Error Handling**: Comprehensive error handling middleware
- **Subscription Control**: Businesses with suspended subscriptions cannot accept new scans
- **Role-Based Access**: Admin routes are protected from business owner access

## 📝 Example Usage

### 1. Business Owner Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coffee@shop.com",
    "password": "securepass123",
    "businessName": "Coffee Paradise"
  }'
```

### 2. Get QR Code (after login)
```bash
curl -X GET http://localhost:5000/api/qr/my \
  -H "Authorization: Bearer <your-token>"
```

### 3. Customer Scans QR
```bash
curl -X POST http://localhost:5000/api/scan/<qr-token> \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "customer-device-123"
  }'
```

### 4. Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brahim@stampify.com",
    "password": "stampifyadmin*"
  }'
```

### 5. Get All Businesses (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/businesses \
  -H "Authorization: Bearer <admin-token>"
```

### 6. Suspend Business Subscription (Admin)
```bash
curl -X PATCH http://localhost:5000/api/admin/businesses/<businessId>/subscription \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionStatus": "suspended"
  }'
```

## 🧪 Testing

Import the provided Postman collection (`stampify-postman-collection.json`) to test all endpoints.

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running**
   ```bash
   # Check MongoDB status
   mongosh
   ```

2. **Verify connection string**
   - Local: `mongodb://localhost:27017/stampify`
   - Atlas: Check your connection string in MongoDB Atlas dashboard

3. **Firewall/Network**: Ensure MongoDB port (27017) is accessible

### JWT Token Issues

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration:
  - Business owner tokens: 7 days
  - Admin tokens: 24 hours
- Verify token format: `Bearer <token>`

### Rate Limiting

- Scan endpoint limits: 1 request per 10 seconds per IP
- If you hit the limit, wait 10 seconds before retrying

## 📚 Project Structure

```
stampify-backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Business owner authentication
│   ├── adminController.js   # Admin management endpoints
│   ├── stampCardController.js
│   ├── qrController.js
│   ├── scanController.js
│   └── customerController.js
├── middleware/
│   ├── auth.js              # JWT authentication (business owners)
│   ├── adminAuth.js         # Admin JWT authentication
│   ├── validation.js        # Request validation
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── BusinessOwner.js
│   ├── AdminUser.js
│   └── Customer.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js       # Admin endpoints
│   ├── stampCardRoutes.js
│   ├── qrRoutes.js
│   ├── scanRoutes.js
│   └── customerRoutes.js
├── services/
│   └── qrService.js         # QR code generation
├── scripts/
│   └── seedAdmin.js         # Admin user seed script
├── server.js                # Main entry point
├── package.json
└── README.md
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<strong-admin-password>
```

### Recommended Services

- **MongoDB**: MongoDB Atlas (cloud)
- **Hosting**: Heroku, Railway, Render, AWS, etc.

## 📄 License

ISC

## 👥 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

For issues or questions, please open an issue in the repository.

