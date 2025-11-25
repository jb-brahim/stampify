const axios = require('axios');

const API_URL = 'https://stampify-iaaa.onrender.com/api';
const QR_TOKEN = '549328d6-2917-4469-ad05-e8b2ea8ca8f2';
const DEVICE_ID = 'test-device-' + Date.now();

async function testScan() {
    try {
        console.log(`Testing scan for token: ${QR_TOKEN}`);
        console.log(`Device ID: ${DEVICE_ID}`);

        const response = await axios.post(`${API_URL}/scan/${QR_TOKEN}`, {
            deviceId: DEVICE_ID
        });

        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testScan();
