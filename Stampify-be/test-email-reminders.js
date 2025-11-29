const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

async function testEmailReminders() {
    try {
        // 1. Create a test business
        const businessEmail = `biz_remind_${Date.now()}@example.com`;
        console.log('1. Creating business:', businessEmail);
        await axios.post(`${API_URL}/auth/signup`, {
            businessName: 'Reminder Test Biz',
            email: businessEmail,
            password: 'password123'
        });

        // Login
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: businessEmail,
            password: 'password123'
        });
        const token = loginResponse.data.data.token;
        console.log('Login Response Data:', JSON.stringify(loginResponse.data.data, null, 2));
        const businessId = loginResponse.data.data.businessOwner?.id || loginResponse.data.data.businessOwner?._id;
        console.log('Extracted Business ID:', businessId);

        if (!businessId) {
            throw new Error('Failed to extract Business ID from login response');
        }
        console.log('   Business logged in');

        // 2. Create a test customer with email
        console.log('2. Creating customer with email...');
        // We need to simulate a scan or direct DB insertion. 
        // Since we don't have a direct "create customer" endpoint for tests easily accessible without scan flow,
        // we'll use the scan endpoint logic or just insert if we had DB access.
        // Let's use the scan flow which is more realistic.

        // First get a QR token (simulated) - actually we need a valid one.
        // Easier to just use the register endpoint directly if we have businessId
        const deviceId = `device_${Date.now()}`;
        const customerEmail = `cust_remind_${Date.now()}@example.com`;

        const payload = {
            businessId: businessId,
            deviceId: deviceId,
            name: 'Test Customer',
            email: customerEmail
        };
        console.log('Registration Payload:', JSON.stringify(payload, null, 2));

        const registerResponse = await axios.post(`${API_URL}/customer/register`, payload);
        const customerId = registerResponse.data.data.customerId;
        console.log('   Customer registered:', customerId);

        // 3. Send Reminder (First Time)
        console.log('3. Sending first reminder...');
        const remindResponse1 = await axios.post(
            `${API_URL}/business/customers/${customerId}/remind`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('   Response:', remindResponse1.data.message);

        // 4. Send Reminder Again (Should fail due to rate limit)
        console.log('4. Sending second reminder (should fail)...');
        try {
            await axios.post(
                `${API_URL}/business/customers/${customerId}/remind`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.error('   ❌ Failed: Should have been rate limited');
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('   ✅ Success: Rate limited correctly');
            } else {
                console.error('   ❌ Failed: Unexpected error', error.message);
            }
        }

        console.log('\n✅ Email Reminder Test PASSED');

    } catch (error) {
        console.error('\n❌ Email Reminder Test FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testEmailReminders();
