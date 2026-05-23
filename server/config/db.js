const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string in the environment variables.
 */
const connectDB = async () => {
    try {
        const connString = process.env.DATABASE_URL || process.env.MONGO_URI;
        
        if (!connString) {
            console.error('❌ FATAL ERROR: DATABASE_URL is not defined in the environment.');
            process.exit(1);
        }

        console.log('⏳ Connecting to MongoDB...');
        
        const conn = await mongoose.connect(connString, {
            family: 4,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
        
        // Handle connection pooling / error after initial connection
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Runtime Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB Disconnected. Standard behavior might be affected.');
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:');
        console.error(error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 HINT: This error often happens if:');
            console.error('1. Your IP address is not whitelisted in MongoDB Atlas.');
            console.error('2. Your internet connection is blocked or using a restrictive firewall.');
            console.error('3. The cluster is currently paused or unreachable.');
        }

        if (error.message.includes('Authentication failed')) {
            console.error('\n💡 HINT: Check your DATABASE_URL in the .env file. The username or password may be incorrect.');
        }

        process.exit(1);
    }
};

module.exports = connectDB;
