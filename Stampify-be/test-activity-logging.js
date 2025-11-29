const mongoose = require('mongoose');
const BusinessOwner = require('./models/BusinessOwner');
const Customer = require('./models/Customer');
const ActivityLog = require('./models/ActivityLog');
const { updateCard } = require('./controllers/stampCardController');
const { getActivityLogs } = require('./controllers/businessController');
require('dotenv').config();

// Mock Express Request/Response
const mockReq = (user, body, query) => ({
    user,
    body,
    query
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

async function testActivityLogging() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Create a test business owner
        const businessId = new mongoose.Types.ObjectId();
        const businessOwner = await BusinessOwner.create({
            _id: businessId,
            businessName: 'Test Activity Log',
            email: `test-activity-${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log(`Created business: ${businessOwner.businessName}`);

        // 2. Perform an action (Update Card)
        console.log('Updating card settings...');
        const updateReq = mockReq(
            { _id: businessId },
            { totalStamps: 12, rewardText: 'Free Coffee' }
        );
        const updateRes = mockRes();

        await updateCard(updateReq, updateRes);

        if (updateRes.data && updateRes.data.success) {
            console.log('Card updated successfully.');
        } else {
            console.error('Card update failed:', updateRes.data);
            process.exit(1);
        }

        // 3. Fetch Activity Logs
        console.log('Fetching activity logs...');
        const logsReq = mockReq({ id: businessId }, {}, {});
        const logsRes = mockRes();

        await getActivityLogs(logsReq, logsRes);

        if (logsRes.data && logsRes.data.success) {
            const logs = logsRes.data.data;
            console.log(`Found ${logs.length} activity logs.`);

            if (logs.length > 0) {
                const log = logs[0];
                if (log.action === 'CARD_UPDATED' && log.businessId.toString() === businessId.toString()) {
                    console.log('SUCCESS: Correct activity log found.');
                    console.log('Log details:', log.details);
                } else {
                    console.error('FAILURE: Incorrect log data.', log);
                    process.exit(1);
                }
            } else {
                console.error('FAILURE: No logs found.');
                process.exit(1);
            }
        } else {
            console.error('Fetch logs failed:', logsRes.data);
            process.exit(1);
        }

        // Cleanup
        await BusinessOwner.findByIdAndDelete(businessId);
        await ActivityLog.deleteMany({ businessId });

        console.log('Test completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testActivityLogging();
