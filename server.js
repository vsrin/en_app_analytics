/**
 * Analytics API Server
 * 
 * Simple REST API that queries MongoDB views for analytics dashboard
 * All views already exist - this just exposes them via HTTP endpoints
 * 
 * Deploy: Same server as existing tm-lossrun API
 * Port: 3001 (or configure)
 * Auth: JWT middleware (already have Auth0)
 */

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://artifi:root@artifi.2vi2m.mongodb.net/?retryWrites=true&w=majority&appName=Artifi";
const DATABASE = "TM-LOSSRUN";

let db;

// Connect to MongoDB
async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGO_URI);
        db = client.db(DATABASE);
        console.log(`✅ Connected to MongoDB: ${DATABASE}`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE (TODO: Replace with your JWT middleware)
// ============================================================================
function requireAuth(req, res, next) {
    // TODO: Add your Auth0 JWT validation here
    // For now, just pass through
    // Example:
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.status(401).json({ error: 'No token provided' });
    // verify token...
    next();
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ----------------------------------------------------------------------------
// 1. GET /api/analytics/apps
// List all available apps with quick stats
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps', requireAuth, async (req, res) => {
    try {
        // Hardcoded app registry
        const apps = [
            {
                app_id: 'loss-run-intelligence',
                app_name: 'Loss Run Intelligence',
                description: 'Insurance loss run processing & analytics',
                color: '#4285F4',
                status: 'active',
                database: 'TM-LOSSRUN'
            }
            // Add more apps here as you build them
        ];

        // Quick stats for each active app
        for (const app of apps) {
            if (app.status === 'active') {
                const userCount = await db.collection('user_activity').countDocuments();
                const batchCount = await db.collection('user_activity').aggregate([
                    { $project: { batch_count: { $size: "$batch_ids" } } },
                    { $group: { _id: null, total: { $sum: "$batch_count" } } }
                ]).toArray();
                
                const todayStats = await db.collection('daily_system_health')
                    .findOne({ date: new Date().toISOString().split('T')[0] });

                app.stats = {
                    total_users: userCount,
                    active_today: todayStats?.total_batches || 0,
                    total_batches: batchCount[0]?.total || 0
                };
            }
        }

        res.json({ apps });
    } catch (error) {
        console.error('Error fetching apps:', error);
        res.status(500).json({ error: 'Failed to fetch apps', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 2. GET /api/analytics/apps/:appId/system-health
// System overview metrics (daily aggregated)
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/system-health', requireAuth, async (req, res) => {
    try {
        const { appId } = req.params;
        const days = parseInt(req.query.days) || 7;
        const targetDate = req.query.date || new Date().toISOString().split('T')[0];

        // Validate app exists
        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        // Get today's stats
        const current = await db.collection('daily_system_health').findOne({ 
            date: targetDate 
        });

        // Get trend data (last N days)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        const trend = await db.collection('daily_system_health')
            .find({ date: { $gte: startDateStr } })
            .sort({ date: 1 })
            .toArray();

        res.json({
            app_id: appId,
            current: current || {
                date: targetDate,
                total_batches: 0,
                total_policies: 0,
                total_claims: 0,
                matched_claims: 0,
                unmatched_claims: 0,
                match_rate: 0,
                avg_processing_time: 0,
                success_rate: 0
            },
            trend: trend.map(day => ({
                date: day.date,
                total_batches: day.total_batches,
                total_policies: day.total_policies,
                avg_processing_time: day.avg_processing_time,
                match_rate: day.match_rate,
                success_rate: day.success_rate
            }))
        });
    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({ error: 'Failed to fetch system health', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 3. GET /api/analytics/apps/:appId/users
// User activity list
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/users', requireAuth, async (req, res) => {
    try {
        const { appId } = req.params;
        const sort = req.query.sort || 'batches';
        const limit = parseInt(req.query.limit) || 50;
        const organization = req.query.organization;

        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        // Map sort param to field name
        const sortFields = {
            'batches': 'total_batches',
            'policies': 'total_policies',
            'last_active': 'last_activity'
        };
        const sortField = sortFields[sort] || 'total_batches';

        // Build filter
        const filter = organization ? { organization } : {};

        // Query user_dashboard view
        const users = await db.collection('user_dashboard')
            .find(filter)
            .sort({ [sortField]: -1 })
            .limit(limit)
            .toArray();

        const totalCount = await db.collection('user_dashboard').countDocuments(filter);

        res.json({
            users: users.map(user => ({
                username: user.username,
                organization: user.organization,
                total_batches: user.total_batches,
                total_policies: user.total_policies,
                total_claims_raw: user.total_claims_raw,
                matched_claims: user.matched_claims,
                match_rate: user.match_rate,
                avg_processing_time: user.avg_processing_time_seconds,
                first_request: user.first_activity,
                last_request: user.last_activity
            })),
            total_count: totalCount
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 4. GET /api/analytics/apps/:appId/batches
// Batch list with filtering
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/batches', requireAuth, async (req, res) => {
    try {
        const { appId } = req.params;
        const user = req.query.user;
        const date = req.query.date;
        const status = req.query.status;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        // Build filter
        const filter = {};
        if (user) filter.username = user;
        if (date) filter.date = date;
        if (status) filter.status = status;

        // Query batch_details view
        const batches = await db.collection('batch_details')
            .find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalCount = await db.collection('batch_details').countDocuments(filter);

        res.json({
            batches: batches.map(batch => ({
                batch_id: batch.batch_id,
                username: batch.username,
                organization: batch.organization,
                timestamp: batch.timestamp,
                date: batch.date,
                policy_count: batch.policy_count,
                pdf_count: batch.pdf_count,
                total_claims: batch.total_claims,
                matched_claims: batch.matched_claims,
                unmatched_claims: batch.unmatched_claims,
                match_rate: batch.match_rate,
                avg_processing_time: batch.avg_processing_time,
                status: batch.status,
                products: batch.products
            })),
            total_count: totalCount,
            page: Math.floor(skip / limit) + 1,
            pages: Math.ceil(totalCount / limit)
        });
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ error: 'Failed to fetch batches', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 5. GET /api/analytics/apps/:appId/batches/:batchId
// Single batch detail with policies
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/batches/:batchId', requireAuth, async (req, res) => {
    try {
        const { appId, batchId } = req.params;

        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        // Query batch_details view
        const batch = await db.collection('batch_details').findOne({ 
            batch_id: batchId 
        });

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        res.json({
            batch_id: batch.batch_id,
            username: batch.username,
            organization: batch.organization,
            timestamp: batch.timestamp,
            date: batch.date,
            status: batch.status,
            summary: {
                policy_count: batch.policy_count,
                pdf_count: batch.pdf_count,
                total_claims: batch.total_claims,
                matched_claims: batch.matched_claims,
                unmatched_claims: batch.unmatched_claims,
                match_rate: batch.match_rate,
                avg_processing_time: batch.avg_processing_time
            },
            products: batch.products,
            policies: batch.policies.map(policy => ({
                appnum: policy.appnum,
                status: policy.status,
                stats: policy.stats,
                products: policy.stats.products,
                processing_time: policy.timing?.duration_seconds
            }))
        });
    } catch (error) {
        console.error('Error fetching batch detail:', error);
        res.status(500).json({ error: 'Failed to fetch batch detail', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 6. GET /api/analytics/apps/:appId/failures
// Mapping failures analysis
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/failures', requireAuth, async (req, res) => {
    try {
        const { appId } = req.params;
        const groupBy = req.query.group_by || 'lob';
        const minIncurred = parseFloat(req.query.min_incurred) || 0;
        const limit = parseInt(req.query.limit) || 50;

        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        if (groupBy === 'lob') {
            // Aggregate by LOB code
            const byLob = await db.collection('mapping_failures').aggregate([
                { $group: {
                    _id: "$raw_lob",
                    failure_count: { $sum: 1 },
                    total_incurred: { $sum: "$incurred" },
                    affected_carriers: { $addToSet: "$carrier" },
                    common_reason: { $first: "$unmatched_reason" }
                }},
                { $sort: { failure_count: -1 } },
                { $limit: 20 }
            ]).toArray();

            // Calculate summary
            const totalUnmatched = await db.collection('mapping_failures').countDocuments();
            const totalValue = await db.collection('mapping_failures').aggregate([
                { $group: { _id: null, total: { $sum: "$incurred" } } }
            ]).toArray();
            const uniqueLobs = await db.collection('mapping_failures').distinct('raw_lob');

            res.json({
                summary: {
                    total_unmatched: totalUnmatched,
                    total_unmapped_value: totalValue[0]?.total || 0,
                    unique_lob_codes: uniqueLobs.length
                },
                by_lob: byLob.map(item => ({
                    lob_code: item._id,
                    failure_count: item.failure_count,
                    total_incurred: Math.round(item.total_incurred * 100) / 100,
                    affected_carriers: item.affected_carriers,
                    common_reason: item.common_reason
                }))
            });
        } else if (groupBy === 'carrier') {
            // Aggregate by carrier
            const byCarrier = await db.collection('mapping_failures').aggregate([
                { $group: {
                    _id: "$carrier",
                    failure_count: { $sum: 1 },
                    total_incurred: { $sum: "$incurred" },
                    unique_lob_codes: { $addToSet: "$raw_lob" }
                }},
                { $sort: { failure_count: -1 } },
                { $limit: 20 }
            ]).toArray();

            res.json({
                by_carrier: byCarrier.map(item => ({
                    carrier: item._id,
                    failure_count: item.failure_count,
                    total_incurred: Math.round(item.total_incurred * 100) / 100,
                    unique_lob_codes: item.unique_lob_codes.length,
                    lob_codes: item.unique_lob_codes
                }))
            });
        } else {
            // Individual failures
            const filter = minIncurred > 0 ? { incurred: { $gte: minIncurred } } : {};
            
            const failures = await db.collection('mapping_failures')
                .find(filter)
                .sort({ date: -1, incurred: -1 })
                .limit(limit)
                .toArray();

            res.json({
                failures: failures.map(f => ({
                    loss_number: f.loss_number,
                    batch_id: f.batch_id,
                    appnum: f.appnum,
                    date: f.date,
                    raw_lob: f.raw_lob,
                    description: f.description,
                    incurred: Math.round(f.incurred * 100) / 100,
                    carrier: f.carrier,
                    unmatched_reason: f.unmatched_reason,
                    date_of_loss: f.date_of_loss
                })),
                total_count: await db.collection('mapping_failures').countDocuments(filter)
            });
        }
    } catch (error) {
        console.error('Error fetching failures:', error);
        res.status(500).json({ error: 'Failed to fetch failures', message: error.message });
    }
});

// ----------------------------------------------------------------------------
// 7. GET /api/analytics/apps/:appId/products
// Product breakdown
// ----------------------------------------------------------------------------
app.get('/api/analytics/apps/:appId/products', requireAuth, async (req, res) => {
    try {
        const { appId } = req.params;

        if (appId !== 'loss-run-intelligence') {
            return res.status(404).json({ error: 'App not found' });
        }

        // Query product_breakdown_view
        const products = await db.collection('product_breakdown_view')
            .find()
            .sort({ policies_count: -1 })
            .toArray();

        res.json({
            products: products.map(p => ({
                product: p.product,
                policies_count: p.policies_count,
                batches_count: p.batches_count
            }))
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', message: error.message });
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Analytics API server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`📁 API base: http://localhost:${PORT}/api/analytics`);
    });
}

start();