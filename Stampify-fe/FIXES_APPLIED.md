# Fixes Applied to Stampify Frontend

## Issues Fixed

### 1. ✅ Removed Duplicate Lockfile
- **Problem**: Both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm) existed
- **Solution**: Deleted `pnpm-lock.yaml` since npm is being used
- **Impact**: Eliminates Next.js workspace root warning

### 2. ✅ Fixed Missing Icon Files in Manifest
- **Problem**: `manifest.json` referenced `/icon-192.png` and `/icon-512.png` which didn't exist
- **Solution**: Updated manifest to use existing icons:
  - `/icon.svg` (SVG format, works at any size)
  - `/apple-icon.png` (for iOS devices)
- **Impact**: Eliminates 404 errors for missing icon files

### 3. ✅ Fixed API Endpoints to Match Backend
- **Problem**: API service had incorrect endpoints that didn't match the backend
- **Solution**: Updated all endpoints in `services/api.ts`:

#### Business API
- ✅ `getCard()` - GET `/card/my`
- ✅ `updateCard()` - PUT `/card/update`
- ✅ `getQR()` - GET `/qr/my`
- ❌ Removed `getStats()` - endpoint doesn't exist in backend

#### Customer API
- ✅ `getCustomerCard(customerId)` - GET `/customer/:customerId`
- ✅ `scanQR(qrToken, deviceId)` - POST `/scan/:qrToken` with `{ deviceId }`

#### Admin API
- ✅ `login(email, password)` - POST `/admin/login`
- ✅ `getStats()` - GET `/admin/stats`
- ✅ `getBusinesses()` - GET `/admin/businesses`
- ✅ `getBusinessCustomers(businessId)` - GET `/admin/businesses/:businessId/customers`
- ✅ `updateSubscription()` - PATCH `/admin/businesses/:businessId/subscription`
  - Fixed: Changed from PUT to PATCH
  - Fixed: Changed from `/status` to `/subscription`
  - Fixed: Changed parameter from `isActive` to `subscriptionStatus: "active" | "suspended"`

### 4. ✅ Enhanced Authentication Handling
- **Problem**: Admin and business owner tokens were mixed
- **Solution**: 
  - Updated request interceptor to check for admin token on admin routes
  - Admin token stored separately in `stampify-admin-auth`
  - Updated response interceptor to redirect to correct login page based on route

### 5. ✅ Fixed Next.js Workspace Warning
- **Problem**: Next.js warning about multiple lockfiles in parent directories
- **Solution**: Added `experimental.turbo.root` config to `next.config.mjs`
- **Impact**: Reduces workspace root warnings

## Files Modified

1. ✅ `services/api.ts` - Fixed all API endpoints and authentication
2. ✅ `public/manifest.json` - Updated icon references
3. ✅ `next.config.mjs` - Added workspace root config
4. ✅ `pnpm-lock.yaml` - **DELETED** (removed duplicate lockfile)

## Testing Checklist

After these fixes, verify:

- [ ] Server starts without workspace warnings
- [ ] No 404 errors for icon files
- [ ] Business owner login/signup works
- [ ] Admin login works
- [ ] Business owner can view/edit stamp card
- [ ] Business owner can view QR code
- [ ] Admin can view all businesses
- [ ] Admin can view business customers
- [ ] Admin can update subscription status
- [ ] Customer can scan QR codes
- [ ] Customer can view stamp card

## API Base URL

Make sure to set the environment variable:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Or it defaults to `http://localhost:5000/api`

## Notes

- Admin authentication is now separate from business owner authentication
- Admin tokens are stored in `stampify-admin-auth` localStorage key
- Business owner tokens are stored in `stampify-auth` localStorage key
- All endpoints now match the backend API structure
- Device ID must be generated and passed when scanning QR codes

