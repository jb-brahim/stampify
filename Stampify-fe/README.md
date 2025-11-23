# Stampify - Digital Stamp Cards

A modern, minimalistic web app for businesses to create digital loyalty stamp cards and customers to collect stamps via QR scanning.

## Features

- **Business Dashboard**: Manage stamp cards, view analytics, and generate QR codes
- **Customer Experience**: Collect stamps via QR scanning and track progress
- **PWA Support**: Install as a native app on any device
- **Real-time Updates**: Instant stamp collection and progress tracking
- **Responsive Design**: Beautiful UI that works on all screen sizes

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI components
- **State Management**: Zustand with persistence
- **QR Code**: QR Scanner library, QRCode.js
- **PWA**: Service Worker, Web App Manifest
- **API**: Axios with interceptors

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend setup)

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file:

\`\`\`env
VITE_API_BASE_URL=http://localhost:3001/api
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## PWA Testing

1. Build the app for production
2. Serve with HTTPS (required for PWA)
3. Open in browser and look for "Install" prompt
4. Test offline functionality by disconnecting network

## Project Structure

\`\`\`
/app                 # Next.js app directory
  /dashboard         # Business owner pages
  /cards             # Customer pages
  /scan              # QR scanning pages
/components          # React components
  /ui                # Shadcn UI components
/store               # Zustand state stores
/services            # API services
/lib                 # Utilities and types
/public              # Static assets, PWA files
\`\`\`

## Features by User Type

### Business Owners
- Create and customize stamp cards
- Generate unique QR codes
- View analytics and customer engagement
- Track stamp distribution and rewards

### Customers
- Scan QR codes to collect stamps
- View all stamp cards in one place
- Track progress toward rewards
- Install as PWA for quick access

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL

## API Integration

The app requires a backend API with these endpoints:

\`\`\`
POST /auth/login
POST /auth/signup
GET  /card/my
PUT  /card/update
GET  /qr/my
POST /scan/:qrToken
GET  /customer/cards
GET  /stats/business
\`\`\`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## PWA Features

- Offline support for core pages
- Add to home screen
- Native app-like experience
- Background sync (future)
- Push notifications (future)

## License

MIT
