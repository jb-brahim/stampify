const axios = require('axios');

const API_URL = 'https://stampify-iaaa.onrender.com/api';

async function testLogin() {
    try {
        console.log('Testing login...');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'brahimojaballi@gmail.com',
            password: 'brahim'
        });
        console.log('Login successful!');
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401) {
                console.log('\nAccount may not exist. Trying signup...');
                await testSignup();
            }
        } else {
            console.error('Message:', error.message);
        }
    }
}

async function testSignup() {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
            email: 'brahimojaballi@gmail.com',
            password: 'brahim',
            businessName: 'brahim'
        });
        console.log('Signup successful!');
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Signup failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testLogin();
