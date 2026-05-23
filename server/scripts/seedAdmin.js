const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@campusfreelance.com';
        
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            fullName: 'Platform Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=1ab2a6',
            isVerified: true
        });

        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
