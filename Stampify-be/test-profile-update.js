const mongoose = require('mongoose');
const BusinessOwner = require('./models/BusinessOwner');
const { updateProfile } = require('./controllers/authController');
require('dotenv').config();

// Mock Express Request/Response
const mockReq = (body, user) => ({
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

async function testProfileUpdate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a test business owner
        const businessId = new mongoose.Types.ObjectId();
        const initialName = 'Original Name';

        const businessOwner = await BusinessOwner.create({
            _id: businessId,
            businessName: initialName,
            email: `test-profile-${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log(`Created business: ${initialName}`);

        // 2. Update Profile
        const newName = 'Updated Business Name';
        console.log(`Updating profile to: ${newName}`);

        const req = mockReq({ businessName: newName }, { id: businessId });
        const res = mockRes();

        await updateProfile(req, res);

        if (res.data && res.data.success) {
            console.log('Update successful:', res.data.message);
            if (res.data.data.businessOwner.businessName === newName) {
                console.log('SUCCESS: Name updated in response.');
            } else {
                console.error('FAILURE: Name NOT updated in response.');
                process.exit(1);
            }
        } else {
            console.error('Update failed:', res.data);
            process.exit(1);
        }

        // 3. Verify in DB
        const updatedOwner = await BusinessOwner.findById(businessId);
        if (updatedOwner.businessName === newName) {
            console.log('SUCCESS: Name updated in database.');
        } else {
            console.error('FAILURE: Name NOT updated in database.');
            process.exit(1);
        }

        // Cleanup
        await BusinessOwner.findByIdAndDelete(businessId);

        console.log('Test completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testProfileUpdate();
