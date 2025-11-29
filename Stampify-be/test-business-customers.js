const mongoose = require('mongoose');
const BusinessOwner = require('./models/BusinessOwner');
const Customer = require('./models/Customer');
const { getCustomers } = require('./controllers/businessController');
require('dotenv').config();

// Mock Express Request/Response
const mockReq = (user) => ({
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

async function testBusinessCustomers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a test business owner
        const businessId = new mongoose.Types.ObjectId();
        const businessOwner = await BusinessOwner.create({
            _id: businessId,
            businessName: 'Test Business Customers',
            email: `test-biz-cust-${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log(`Created business: ${businessOwner.businessName}`);

        // 2. Create test customers
        const customer1 = await Customer.create({
            businessId: businessId,
            deviceId: `device-1-${Date.now()}`,
            name: 'Customer One',
            email: 'cust1@example.com',
            stamps: 5
        });

        const customer2 = await Customer.create({
            businessId: businessId,
            deviceId: `device-2-${Date.now()}`,
            name: 'Customer Two',
            email: 'cust2@example.com',
            stamps: 2
        });

        console.log('Created 2 test customers.');

        // 3. Fetch customers
        console.log('Fetching customers...');
        const req = mockReq({ id: businessId });
        const res = mockRes();

        await getCustomers(req, res);

        if (res.data && res.data.success) {
            console.log('Fetch successful.');
            const customers = res.data.data;
            console.log(`Found ${customers.length} customers.`);

            if (customers.length === 2) {
                console.log('SUCCESS: Correct number of customers returned.');
                const names = customers.map(c => c.name);
                if (names.includes('Customer One') && names.includes('Customer Two')) {
                    console.log('SUCCESS: Correct customer names returned.');
                } else {
                    console.error('FAILURE: Incorrect customer names.');
                    process.exit(1);
                }
            } else {
                console.error(`FAILURE: Expected 2 customers, got ${customers.length}.`);
                process.exit(1);
            }
        } else {
            console.error('Fetch failed:', res.data);
            process.exit(1);
        }

        // Cleanup
        await BusinessOwner.findByIdAndDelete(businessId);
        await Customer.deleteMany({ businessId });

        console.log('Test completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testBusinessCustomers();
