/**
 * Environment Configuration and Validation Utility
 * 
 * This file handles loading environment variables and ensures all
 * required keys are present before the application starts.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

/**
 * Validates that all required environment variables are set.
 * Throws an error with a descriptive message if any are missing.
 */
const validateEnv = () => {
    const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'SESSION_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ FATAL ERROR: Missing required environment variables:');
        missingVars.forEach(v => console.error(`   - ${v}`));
        console.error('\nPlease check your .env file or environment settings.');
        process.exit(1); // Exit with failure
    }

    console.log('✅ Environment variables validated successfully.');
};

// Export configuration
export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        url: process.env.DATABASE_URL,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        sessionSecret: process.env.SESSION_SECRET,
    },
    apis: {
        apiKey: process.env.API_KEY,
    },
    cloudinary: {
        name: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    }
};

// Run validation if this script is being used in production/development
// You can call this from your app's main entry point (e.g., index.js)
export { validateEnv };
