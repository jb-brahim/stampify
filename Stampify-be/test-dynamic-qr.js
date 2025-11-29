const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const BusinessOwner = require('./models/BusinessOwner');
const Customer = require('./models/Customer');
const { scanQR } = require('./controllers/scanController');
require('dotenv').config();

// Mock Express Request/Response
const mockReq = (params, body, user) => ({
    params,
    body,
    user
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testDynamicQR() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a test business owner
        const businessId = new mongoose.Types.ObjectId();
        const initialQrToken = uuidv4();

        const businessOwner = await BusinessOwner.create({
            _id: businessId,
            businessName: 'Test Business Dynamic QR',
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            qrToken: initialQrToken,
            stampCard: {
                totalStamps: 10,
                rewardText: 'Free Coffee'
            }
        });
        console.log(`Created business with QR token: ${initialQrToken}`);

        // 2. Create a test customer
        const deviceId = `device-${Date.now()}`;
        const customer = await Customer.create({
            businessId: businessId,
            deviceId: deviceId,
            stamps: 0
        });
        console.log(`Created customer with device ID: ${deviceId}`);

        // 3. Simulate Scan with Initial Token
        console.log('Simulating scan with initial token...');
        const req = mockReq({ qrToken: initialQrToken }, { deviceId });
        const res = mockRes();

        await scanQR(req, res);

        if (res.data && res.data.success) {
            console.log('Scan successful:', res.data.message);
        } else {
            console.error('Scan failed:', res.data);
            process.exit(1);
        }

        // 4. Verify Token Changed
        const updatedBusiness = await BusinessOwner.findById(businessId);
        const newQrToken = updatedBusiness.qrToken;

        console.log(`New QR token: ${newQrToken}`);

        if (newQrToken !== initialQrToken) {
            console.log('SUCCESS: QR token has been regenerated.');
        } else {
            console.error('FAILURE: QR token was NOT regenerated.');
            process.exit(1);
        }

        // 5. Try scanning with old token (should fail)
        console.log('Simulating scan with OLD token...');
        const reqOld = mockReq({ qrToken: initialQrToken }, { deviceId });
        const resOld = mockRes();

        await scanQR(reqOld, resOld);

        if (resOld.statusCode === 404) {
            console.log('SUCCESS: Old token rejected as expected.');
        } else {
            console.error('FAILURE: Old token was NOT rejected.', resOld.data);
        }

        // Cleanup
        await BusinessOwner.findByIdAndDelete(businessId);
        await Customer.findByIdAndDelete(customer._id);

        console.log('Test completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testDynamicQR();
