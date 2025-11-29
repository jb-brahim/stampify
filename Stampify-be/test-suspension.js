const mongoose = require('mongoose');
const BusinessOwner = require('./models/BusinessOwner');
const { login } = require('./controllers/authController');
require('dotenv').config();

const mockReq = (body) => ({ body });
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};

async function testSuspension() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const email = `test-suspend-${Date.now()}@example.com`;
        const password = 'password123';

        const businessOwner = await BusinessOwner.create({
            businessName: 'Test Suspended',
            email,
            password
        });
        console.log('Created business owner.');

        // Suspend the account
        businessOwner.subscriptionStatus = 'suspended';
        await businessOwner.save();
        console.log('Account suspended.');

        // Try to login
        const req = mockReq({ email, password });
        const res = mockRes();
        await login(req, res);

        if (res.statusCode === 403 && res.data.message.includes('suspended')) {
            console.log('SUCCESS: Suspension check works.');
            console.log('Message:', res.data.message);
        } else {
            console.error('FAILURE: Expected 403 with suspension message.');
            console.error('Got:', res.statusCode, res.data);
            process.exit(1);
        }

        await BusinessOwner.findByIdAndDelete(businessOwner._id);
        console.log('Test completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testSuspension();
