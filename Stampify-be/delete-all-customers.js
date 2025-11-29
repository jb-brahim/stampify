const mongoose = require('mongoose');
require('dotenv').config();

const Customer = require('./models/Customer');

async function deleteAllCustomers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all customers
        const result = await Customer.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} customers`);

        console.log('✅ All customers deleted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteAllCustomers();
