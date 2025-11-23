# Admin Role Setup Guide

This guide explains how to set up and use the admin role in Stampify backend.

## 📋 Overview

The admin role provides super-admin capabilities to manage all business owners, view customer data, and control business subscriptions.

## 🚀 Quick Setup

### 1. Create Admin User

After installing dependencies and setting up your `.env` file, run:

```bash
npm run seed:admin
```

This creates the first admin user with default credentials:
- **Email**: `brahim@stampify.com` (or from `ADMIN_EMAIL` in `.env`)
- **Password**: `stampifyadmin*` (or from `ADMIN_PASSWORD` in `.env`)

⚠️ **Important**: Change the default password immediately after first login!

### 2. Environment Variables

Add these to your `.env` file (optional - defaults are used if not set):

```env
ADMIN_EMAIL=brahim@stampify.com
ADMIN_PASSWORD=stampifyadmin*
```

### 3. Login as Admin

```bash
POST /api/admin/login
{
  "email": "brahim@stampify.com",
  "password": "stampifyadmin*"
}
```

Response includes a JWT token with `role: "admin"` claim.

## 🔐 Admin Authentication

Admin endpoints require a JWT token obtained from `/api/admin/login`. The token includes a `role: "admin"` claim that is verified by the `adminAuth` middleware.

**Important**: 
- Business owner tokens **cannot** access admin routes
- Admin tokens use the same `Authorization: Bearer <token>` format
- Admin tokens expire after 24 hours (business owner tokens expire after 7 days)

## 📡 Admin Endpoints

### 1. Admin Login
- **POST** `/api/admin/login`
- Public endpoint (no auth required)
- Returns admin JWT token

### 2. Get All Businesses
- **GET** `/api/admin/businesses`
- Returns all business owners with customer counts
- Includes subscription status

### 3. Get Business Customers
- **GET** `/api/admin/businesses/:businessId/customers`
- Returns all customers for a specific business
- Shows stamp counts and reward status

### 4. Update Business Subscription
- **PATCH** `/api/admin/businesses/:businessId/subscription`
- Suspend or reactivate a business subscription
- Can set subscription expiry date

### 5. Get Admin Statistics
- **GET** `/api/admin/stats`
- Dashboard statistics including:
  - Total businesses and customers
  - Active vs suspended businesses
  - Total stamps given
  - Customers with rewards
  - Top businesses by activity

## 🛡️ Security Features

1. **Role-Based Access Control**
   - Admin routes protected by `adminAuth` middleware
   - Verifies JWT token and admin role
   - Business owners cannot access admin endpoints

2. **Subscription Control**
   - Businesses with `subscriptionStatus: "suspended"` cannot accept new scans
   - Scanning attempts return 403 error for suspended businesses

3. **Password Security**
   - Admin passwords hashed with bcrypt (same as business owners)
   - Minimum 6 characters required

## 📊 Database Models

### AdminUser
- `email` (String, unique, required)
- `password` (String, hashed)
- `role` (String, default: 'admin')
- `createdAt`, `updatedAt` (timestamps)

### BusinessOwner (Updated)
New fields:
- `subscriptionStatus` (String, enum: ['active', 'suspended'], default: 'active')
- `subscriptionExpiry` (Date, optional)

## 🔄 Workflow Examples

### Suspend a Business

```bash
# 1. Login as admin
POST /api/admin/login
→ Save admin token

# 2. Get all businesses
GET /api/admin/businesses
→ Find business ID

# 3. Suspend subscription
PATCH /api/admin/businesses/<businessId>/subscription
Authorization: Bearer <admin-token>
{
  "subscriptionStatus": "suspended"
}
```

### View Business Activity

```bash
# 1. Get business customers
GET /api/admin/businesses/<businessId>/customers
Authorization: Bearer <admin-token>

# 2. Get statistics
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

### Reactivate a Business

```bash
PATCH /api/admin/businesses/<businessId>/subscription
Authorization: Bearer <admin-token>
{
  "subscriptionStatus": "active",
  "subscriptionExpiry": "2024-12-31T23:59:59.000Z"
}
```

## 🧪 Testing with Postman

1. Import `stampify-postman-collection.json`
2. Set `base_url` variable to `http://localhost:5000`
3. Call "Admin Login" endpoint
4. Copy the token from response
5. Set `admin_token` variable in Postman
6. Use admin token in other admin endpoints

## ⚠️ Important Notes

1. **First Admin**: Use the seed script to create the first admin. Additional admins can be created programmatically using the AdminUser model.

2. **Password Security**: Always change the default admin password in production.

3. **Subscription Status**: When a business is suspended, existing customers can still view their cards, but new scans will be rejected.

4. **Token Management**: Admin tokens expire after 24 hours (business owner tokens expire after 7 days).

5. **Multiple Admins**: The system supports multiple admin users. Each admin needs to login separately to get their own token.

## 🔧 Troubleshooting

### Admin Login Fails
- Verify admin user exists: Check database or run seed script again
- Check email and password match
- Ensure `.env` variables are set correctly if using custom credentials

### Cannot Access Admin Routes
- Verify token is from admin login (not business owner login)
- Check token hasn't expired
- Ensure `Authorization: Bearer <token>` header is included
- Verify token includes `role: "admin"` in JWT payload

### Subscription Changes Not Working
- Verify business ID is correct
- Check subscription status is either "active" or "suspended"
- Ensure date format for subscriptionExpiry is valid ISO 8601

## 📚 Related Files

- **Model**: `models/AdminUser.js`
- **Controller**: `controllers/adminController.js`
- **Routes**: `routes/adminRoutes.js`
- **Middleware**: `middleware/adminAuth.js`
- **Seed Script**: `scripts/seedAdmin.js`

