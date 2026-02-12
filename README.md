# ElevateNow Analytics API

Simple REST API that exposes MongoDB views for the analytics dashboard.

## 🎯 What This Does

Provides 7 HTTP endpoints that query the MongoDB views you've already created:
- System health metrics
- User activity stats
- Batch processing details
- Mapping failure analysis
- Product breakdown

**No complex logic** - just reads from views and returns JSON.

---

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas (already configured)
- MongoDB views already created:
  - `daily_system_health`
  - `user_dashboard`
  - `batch_details`
  - `mapping_failures`
  - `product_breakdown_view`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI (already filled in)
```

### 3. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

### 4. Test Endpoints

```bash
npm test
```

Or manually:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/analytics/apps
```

---

## 📡 API Endpoints

### Base URL: `/api/analytics`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/apps` | GET | List all apps with stats |
| `/apps/:appId/system-health` | GET | Daily metrics & trends |
| `/apps/:appId/users` | GET | User activity list |
| `/apps/:appId/batches` | GET | Batch list with filters |
| `/apps/:appId/batches/:batchId` | GET | Single batch details |
| `/apps/:appId/failures` | GET | Mapping failures analysis |
| `/apps/:appId/products` | GET | Product breakdown |

---

## 📖 Example Requests

### Get System Health
```bash
GET /api/analytics/apps/loss-run-intelligence/system-health?days=7
```

Response:
```json
{
  "app_id": "loss-run-intelligence",
  "current": {
    "date": "2026-02-12",
    "total_batches": 15,
    "total_policies": 42,
    "match_rate": 89.7,
    "avg_processing_time": 113.2
  },
  "trend": [
    { "date": "2026-02-06", "total_batches": 10, ... },
    { "date": "2026-02-07", "total_batches": 12, ... }
  ]
}
```

### Get Users
```bash
GET /api/analytics/apps/loss-run-intelligence/users?sort=batches&limit=10
```

### Get Batches
```bash
GET /api/analytics/apps/loss-run-intelligence/batches?user=devesh@artifidata.ai&limit=20
```

### Get Failures (Grouped by LOB)
```bash
GET /api/analytics/apps/loss-run-intelligence/failures?group_by=lob
```

---

## 🔒 Authentication (TODO)

Currently **NO AUTH** for development. Before production:

### Add JWT Middleware

1. Install dependencies:
```bash
npm install express-jwt jwks-rsa
```

2. Replace the `requireAuth` middleware in `server.js`:

```javascript
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const requireAuth = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});
```

3. Update `.env`:
```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-audience
```

---

## 🛠️ Developer Tasks (Hardening)

### Priority 1: Security
- [ ] Add JWT authentication middleware
- [ ] Add rate limiting (express-rate-limit)
- [ ] Add input validation (express-validator)
- [ ] Add helmet.js for security headers

### Priority 2: Error Handling
- [ ] Better error messages
- [ ] Logging (winston or pino)
- [ ] Error tracking (Sentry)

### Priority 3: Performance
- [ ] Add caching (Redis or in-memory)
- [ ] Add query pagination for large datasets
- [ ] Add database connection pooling

### Priority 4: Production
- [ ] Add health check with DB ping
- [ ] Add API versioning (/api/v1/analytics)
- [ ] Add request logging
- [ ] Add CORS whitelist (specific domains)
- [ ] Add environment-based configs

---

## 📦 Deployment

### Option A: Same Server as Existing API
```bash
# Deploy to existing tm-lossrun server
# Run on port 3001
# Use nginx to proxy /api/analytics → localhost:3001
```

### Option B: Separate Server
```bash
# Deploy to new server/container
# Configure CORS to allow frontend domain
# Update frontend API_BASE_URL
```

### Nginx Config Example
```nginx
location /api/analytics {
    proxy_pass http://localhost:3001/api/analytics;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🧪 Testing Checklist

- [ ] All 7 endpoints return 200 OK
- [ ] Data matches MongoDB views
- [ ] Filters work correctly (user, date, status)
- [ ] Sorting works (batches, policies, last_active)
- [ ] Pagination works (limit, skip)
- [ ] 404 for invalid app_id
- [ ] 404 for invalid batch_id
- [ ] CORS allows frontend domain
- [ ] Auth blocks unauthenticated requests

---

## 📝 Notes

- All MongoDB views already exist - this just exposes them
- No data writes - read-only API
- Designed to be simple and maintainable
- Easy to add new apps - just update apps array
- Database: TM-LOSSRUN (hardcoded for now)

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGO_URI in .env
- Verify MongoDB Atlas IP whitelist
- Test connection: `mongosh "mongodb+srv://..."`

### "View not found"
- Verify views exist: `db.getCollectionNames()`
- Check view names match exactly

### "Empty results"
- Check data exists: `db.daily_system_health.findOne()`
- Verify date format: "YYYY-MM-DD"

---

## 📞 Questions?

Contact: vs@artifidata.ai