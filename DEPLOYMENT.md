# Stampify Deployment Guide

This guide covers how to deploy the Stampify application, which consists of a Node.js/Express backend and a Next.js frontend.

## 1. Backend Deployment (Node.js/Express)

You can deploy the backend to services like Render, Railway, Heroku, or AWS.

### Prerequisites
- MongoDB Atlas cluster (or other MongoDB instance)
- Environment variables set in your deployment platform

### Environment Variables
Set the following environment variables in your backend deployment service:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port to listen on (usually handled by host) | `5000` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/stampify` |
| `JWT_SECRET` | Secret key for signing tokens | `your-super-secret-key-change-this` |
| `ADMIN_EMAIL` | Email for the initial admin account | `admin@stampify.com` |
| `ADMIN_PASSWORD` | Password for the initial admin account | `secure-admin-password` |
| `FRONTEND_URL` | URL of your deployed frontend (for CORS) | `https://stampify-frontend.vercel.app` |

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

---

## 2. Frontend Deployment (Next.js)

The easiest way to deploy the frontend is using **Vercel** or **Netlify**.

### Environment Variables
**CRITICAL:** You must set the following environment variable to point to your **deployed backend URL**.

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Full URL to your backend API | `https://stampify-backend.onrender.com/api` |

> **Note:** Make sure to include `/api` at the end of the URL if your backend routes are prefixed with it (which they are in this project).

### Steps for Vercel
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Select the `Stampify-fe` directory as the root directory.
4.  In "Environment Variables", add `NEXT_PUBLIC_API_BASE_URL` with your backend URL.
5.  Deploy.

### Steps for Netlify
1.  Push your code to GitHub.
2.  Import the project in Netlify.
3.  Set "Base directory" to `Stampify-fe`.
4.  Set "Build command" to `npm run build`.
5.  Set "Publish directory" to `.next` (or let Netlify auto-detect Next.js).
6.  In "Site settings" > "Environment variables", add `NEXT_PUBLIC_API_BASE_URL`.
7.  Deploy.

## 3. Post-Deployment Verification

1.  **Backend Health**: Visit `https://your-backend-url.com/health` to confirm the backend is running.
2.  **Frontend Connection**: Open your deployed frontend. Try to log in or sign up. If it works, the connection to the backend is successful.
3.  **Admin Access**: Go to `/admin/login` on your deployed frontend and log in with your admin credentials.
