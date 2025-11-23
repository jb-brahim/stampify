# Admin Endpoints Troubleshooting Guide

## Common Issues with "Get All Businesses" Endpoint

### 1. Check Your Request

**Correct Endpoint:**
```
GET http://localhost:5000/api/admin/businesses
```

**Required Headers:**
```
Authorization: Bearer <your-admin-token>
Content-Type: application/json
```

### 2. Verify You Have an Admin Token

**Step 1: Login as Admin**
```bash
POST http://localhost:5000/api/admin/login
{
  "email": "brahim@stampify.com",
  "password": "stampifyadmin*"
}
```

**Step 2: Copy the token from the response**
The response will look like:
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": { ... }
  }
}
```

**Step 3: Use the token in your request**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Common Errors and Solutions

#### Error: "Access denied. No token provided"
**Solution:** Make sure you're including the Authorization header:
```
Authorization: Bearer <your-token>
```
Note: There must be a space between "Bearer" and the token.

#### Error: "Access denied. Admin role required"
**Solution:** You're using a business owner token instead of an admin token. 
- Make sure you logged in using `/api/admin/login` (not `/api/auth/login`)
- Business owner tokens cannot access admin endpoints

#### Error: "Token expired"
**Solution:** Admin tokens expire after 24 hours. Login again to get a new token.

#### Error: "Invalid token"
**Solution:** 
- Check that your JWT_SECRET in `.env` matches
- Make sure you copied the entire token (no spaces or line breaks)
- Verify the token hasn't been modified

#### Error: "Route not found"
**Solution:** 
- Check the URL: Should be `/api/admin/businesses` (not `/api/admin/business` or `/api/businesses`)
- Make sure the server is running
- Verify the route is registered in `server.js`

### 4. Testing with cURL

```bash
# 1. Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brahim@stampify.com","password":"stampifyadmin*"}'

# 2. Copy the token from response, then:
curl -X GET http://localhost:5000/api/admin/businesses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Testing with Postman

1. Import the `stampify-postman-collection.json`
2. Set `base_url` variable to `http://localhost:5000`
3. Run "Admin Login" request
4. Copy the token from the response
5. Set `admin_token` variable in Postman
6. Run "Get All Businesses" request

### 6. Verify Server is Running

Check if the server is running:
```bash
GET http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "Stampify API is running"
}
```

### 7. Check Server Logs

Look at your server console for any error messages. Common issues:
- Database connection errors
- JWT_SECRET not set in `.env`
- MongoDB not running

### 8. Verify Admin User Exists

Make sure you've created the admin user:
```bash
npm run seed:admin
```

### 9. Database Check

If you're getting empty results, that's normal if no businesses exist yet. The endpoint should return:
```json
{
  "success": true,
  "message": "No business owners found",
  "data": {
    "businesses": [],
    "total": 0
  }
}
```

### 10. Still Not Working?

1. **Check server console** for detailed error messages
2. **Verify MongoDB connection** - make sure MongoDB is running
3. **Check .env file** - ensure JWT_SECRET is set
4. **Restart the server** after making changes
5. **Clear browser cache** if testing in browser
6. **Check network tab** in browser dev tools for actual request/response

## Quick Debug Checklist

- [ ] Server is running (`npm run dev` or `npm start`)
- [ ] MongoDB is connected
- [ ] Admin user exists (run `npm run seed:admin`)
- [ ] Logged in as admin (not business owner)
- [ ] Using correct endpoint: `/api/admin/businesses`
- [ ] Authorization header format: `Bearer <token>`
- [ ] Token is from admin login (not business owner login)
- [ ] Token hasn't expired (admin tokens expire in 24h)
- [ ] JWT_SECRET is set in `.env`

