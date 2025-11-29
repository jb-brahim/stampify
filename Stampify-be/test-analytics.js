const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials (use the one created in previous tests)
const TEST_EMAIL = 'testbusiness@example.com';
const TEST_PASSWORD = 'password123';

async function testAnalytics() {
    try {
        // Create user first to ensure it exists
        const email = `analytics_${Date.now()}@example.com`;
        console.log('1. Creating test user:', email);

        try {
            await axios.post(`${API_URL}/auth/signup`, {
                businessName: 'Analytics Test Biz',
                email: email,
                password: 'password123'
            });
        } catch (e) {
            // Ignore if already exists (though timestamp makes it unique)
        }

        console.log('2. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: 'password123'
        });
        const token = loginResponse.data.data.token;
        console.log('   Login successful');

        console.log('3. Fetching Analytics...');
        const analyticsResponse = await axios.get(`${API_URL}/business/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = analyticsResponse.data.data;
        console.log('   Analytics fetched successfully');

        console.log('\n--- Analytics Data ---');
        console.log('Metrics:', JSON.stringify(data.metrics, null, 2));
        console.log('Activity (Last 7 Days):', JSON.stringify(data.activity, null, 2));
        console.log('Peak Hours:', JSON.stringify(data.peakHours, null, 2));

        // Validation
        if (typeof data.metrics.totalStamps !== 'number') throw new Error('Invalid totalStamps');
        if (!Array.isArray(data.activity)) throw new Error('Invalid activity data');
        if (!Array.isArray(data.peakHours)) throw new Error('Invalid peakHours data');

        console.log('\n✅ Analytics Test PASSED');

    } catch (error) {
        console.error('\n❌ Analytics Test FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAnalytics();
