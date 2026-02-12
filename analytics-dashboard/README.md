# ElevateNow Analytics Dashboard

React/TypeScript frontend for the ElevateNow analytics platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running (see ../analytics-api)

### Setup

1. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

App runs on `http://localhost:3000`

## 🔧 Environment Variables

- `REACT_APP_API_BASE_URL` - API endpoint
  - Local: `http://localhost:3001/api/analytics`
  - Production: `https://tm-lossrun.enowclear360.com/api/analytics`

## 📁 Project Structure

```
src/
├── components/
│   ├── AppSelector/      - App selection cards
│   ├── Dashboard/        - Main dashboard views
│   └── Common/           - Shared components
├── services/
│   └── api.ts           - API client
├── config/
│   ├── apps.ts          - App registry
│   └── theme.ts         - ElevateNow colors
├── types/
│   └── index.ts         - TypeScript types
└── App.tsx              - Main app component
```

## 🎨 ElevateNow Brand Colors

- Primary Blue: `#4285F4`
- Navy: `#1C1C46`
- Orange: `#F27629`
- Cyan: `#57CBFF`
- Light Blue: `#6E71FF`

## 📦 Available Scripts

- `npm start` - Start dev server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚢 Deployment

```bash
npm run build
# Deploy 'build' folder to Cloudflare Pages, Netlify, or Vercel
```

## 📝 Notes

- Backend must be running for data
- All API calls use environment variable for URL
- Switch between local/production via .env file
