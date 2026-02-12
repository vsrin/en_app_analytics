#!/bin/bash

###############################################################################
# ElevateNow Analytics Dashboard - Frontend Setup Script
# 
# This script creates a complete React/TypeScript analytics dashboard
# inside the elevatenow-analytics folder alongside analytics-api
#
# Usage: 
#   chmod +x setup-frontend.sh
#   ./setup-frontend.sh
###############################################################################

set -e  # Exit on error

echo "🚀 ElevateNow Analytics Dashboard - Frontend Setup"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "analytics-api" ]; then
    echo "❌ Error: analytics-api folder not found!"
    echo "Please run this script from the elevatenow-analytics directory"
    exit 1
fi

echo "✅ Found analytics-api folder"
echo ""

# Create React app with TypeScript
echo "📦 Creating React app with TypeScript..."
echo "This may take a few minutes..."
echo ""

npx create-react-app analytics-dashboard --template typescript

# Move into the new directory
cd analytics-dashboard

echo ""
echo "✅ React app created successfully"
echo ""

# Install additional dependencies
echo "📦 Installing additional dependencies..."
echo ""

npm install --save \
    @mui/material \
    @mui/icons-material \
    @emotion/react \
    @emotion/styled \
    recharts \
    react-router-dom \
    axios

echo ""
echo "✅ Dependencies installed"
echo ""

# Create .env.example file
echo "📝 Creating environment configuration..."
cat > .env.example << 'EOF'
# API Configuration
# For local development
REACT_APP_API_BASE_URL=http://localhost:3001/api/analytics

# For production (uncomment and update)
# REACT_APP_API_BASE_URL=https://tm-lossrun.enowclear360.com/api/analytics

# App Configuration
REACT_APP_NAME=ElevateNow Analytics
EOF

# Create .env for local development
cp .env.example .env

echo "✅ Environment files created"
echo ""

# Create .gitignore additions
cat >> .gitignore << 'EOF'

# Environment variables
.env.local
.env.production

# IDE
.vscode/
.idea/
EOF

echo "✅ Updated .gitignore"
echo ""

# Create folder structure
echo "📁 Creating project structure..."

mkdir -p src/components/AppSelector
mkdir -p src/components/Dashboard
mkdir -p src/components/Common
mkdir -p src/services
mkdir -p src/config
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/utils

echo "✅ Folder structure created"
echo ""

# Create placeholder files to prevent errors
echo "📝 Creating placeholder files..."

# Config file
cat > src/config/apps.ts << 'EOF'
export interface AppConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'coming-soon';
  database: string;
}

export const apps: AppConfig[] = [
  {
    id: 'loss-run-intelligence',
    name: 'Loss Run Intelligence',
    description: 'Insurance loss run processing & analytics',
    color: '#4285F4',
    status: 'active',
    database: 'TM-LOSSRUN'
  }
];
EOF

# API service
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/analytics';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
EOF

# Types file
cat > src/types/index.ts << 'EOF'
export interface App {
  app_id: string;
  app_name: string;
  description: string;
  color: string;
  status: string;
  stats?: {
    total_users: number;
    active_today: number;
    total_batches: number;
  };
}

export interface SystemHealth {
  app_id: string;
  current: DailyMetrics;
  trend: DailyMetrics[];
}

export interface DailyMetrics {
  date: string;
  total_batches: number;
  total_policies: number;
  total_claims: number;
  matched_claims: number;
  match_rate: number;
  avg_processing_time: number;
  success_rate: number;
}

export interface User {
  username: string;
  organization: string;
  total_batches: number;
  total_policies: number;
  matched_claims: number;
  match_rate: number;
  avg_processing_time: number;
}

export interface Batch {
  batch_id: string;
  username: string;
  organization: string;
  timestamp: string;
  date: string;
  policy_count: number;
  total_claims: number;
  matched_claims: number;
  match_rate: number;
  avg_processing_time: number;
  status: string;
  products: string[];
}
EOF

# Theme file
cat > src/config/theme.ts << 'EOF'
export const elevateNowTheme = {
  colors: {
    primary: {
      orange: '#F27629',
      lightBlue: '#6E71FF',
      cyan: '#57CBFF',
      blue: '#4285F4',
      navy: '#1C1C46',
      deepBlue: '#2145EA',
      darkBlue: '#112CA9'
    },
    ui: {
      background: '#FAFBFC',
      text: '#1C1C46',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      cardBg: '#FFFFFF'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
};
EOF

echo "✅ Placeholder files created"
echo ""

# Create README
cat > README.md << 'EOF'
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
EOF

echo "✅ README created"
echo ""

echo "=================================================="
echo "✅ Frontend setup complete!"
echo "=================================================="
echo ""
echo "📂 Project structure:"
echo "   elevatenow-analytics/"
echo "   ├── analytics-api/        (Backend)"
echo "   └── analytics-dashboard/  (Frontend - NEW!)"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Add the full React components:"
echo "   cd analytics-dashboard"
echo "   (Components will be created in next step)"
echo ""
echo "2. Start the development server:"
echo "   npm start"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "💡 The frontend will connect to:"
echo "   $(grep REACT_APP_API_BASE_URL analytics-dashboard/.env | cut -d '=' -f2)"
echo ""
echo "To change API URL, edit: analytics-dashboard/.env"
echo ""
