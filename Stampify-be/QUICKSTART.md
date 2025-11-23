# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stampify
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 3: Start MongoDB
**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### Step 4: Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Step 5: Test the API
Visit: http://localhost:5000/health

You should see:
```json
{
  "success": true,
  "message": "Stampify API is running",
  "timestamp": "..."
}
```

## 📝 Quick Test Workflow

1. **Signup a Business Owner**
   ```bash
   POST http://localhost:5000/api/auth/signup
   {
     "email": "coffee@shop.com",
     "password": "password123",
     "businessName": "Coffee Paradise"
   }
   ```
   → Save the `token` from response

2. **Get QR Code**
   ```bash
   GET http://localhost:5000/api/qr/my
   Headers: Authorization: Bearer <token>
   ```
   → Save the `qrToken` from response

3. **Scan QR as Customer**
   ```bash
   POST http://localhost:5000/api/scan/<qrToken>
   {
     "deviceId": "customer-device-123"
   }
   ```
   → Save the `customerId` from response

4. **Check Customer Card**
   ```bash
   GET http://localhost:5000/api/customer/<customerId>
   ```

## 📚 Next Steps

- Import `stampify-postman-collection.json` into Postman for easy testing
- Read the full [README.md](README.md) for detailed documentation
- Customize stamp card settings via `/api/card/update`

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas: Whitelist your IP address

**Port Already in Use:**
- Change `PORT` in `.env` file
- Or stop the process using port 5000

**Module Not Found:**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

