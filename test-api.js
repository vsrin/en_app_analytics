/**
 * Simple API Test Script
 * Run: node test-api.js
 * 
 * Tests all endpoints to verify they work
 */

const BASE_URL = 'http://localhost:3001/api/analytics';

async function testEndpoint(name, url, expectedStatus = 200) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.status === expectedStatus) {
            console.log(`✅ ${name}`);
            console.log(`   Status: ${response.status}`);
            if (data.users) console.log(`   Users: ${data.users.length}`);
            if (data.batches) console.log(`   Batches: ${data.batches.length}`);
            if (data.trend) console.log(`   Trend days: ${data.trend.length}`);
        } else {
            console.log(`❌ ${name}`);
            console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🧪 Testing Analytics API...\n');
    
    // Health check
    await testEndpoint('Health Check', 'http://localhost:3001/health');
    
    // Apps list
    await testEndpoint('GET /apps', `${BASE_URL}/apps`);
    
    // System health
    await testEndpoint('GET /system-health', `${BASE_URL}/apps/loss-run-intelligence/system-health`);
    await testEndpoint('GET /system-health (7 days)', `${BASE_URL}/apps/loss-run-intelligence/system-health?days=7`);
    
    // Users
    await testEndpoint('GET /users', `${BASE_URL}/apps/loss-run-intelligence/users`);
    await testEndpoint('GET /users (sorted)', `${BASE_URL}/apps/loss-run-intelligence/users?sort=policies&limit=10`);
    
    // Batches
    await testEndpoint('GET /batches', `${BASE_URL}/apps/loss-run-intelligence/batches`);
    await testEndpoint('GET /batches (filtered)', `${BASE_URL}/apps/loss-run-intelligence/batches?limit=5`);
    
    // Batch detail (use a real batch_id from your database)
    // await testEndpoint('GET /batch/:id', `${BASE_URL}/apps/loss-run-intelligence/batches/bd808b9e-937d-4243-b9e7-d74e6922719a`);
    
    // Failures
    await testEndpoint('GET /failures (by LOB)', `${BASE_URL}/apps/loss-run-intelligence/failures?group_by=lob`);
    await testEndpoint('GET /failures (by carrier)', `${BASE_URL}/apps/loss-run-intelligence/failures?group_by=carrier`);
    await testEndpoint('GET /failures (individual)', `${BASE_URL}/apps/loss-run-intelligence/failures?group_by=none&limit=10`);
    
    // Products
    await testEndpoint('GET /products', `${BASE_URL}/apps/loss-run-intelligence/products`);
    
    console.log('\n✅ All tests completed!');
}

runTests();