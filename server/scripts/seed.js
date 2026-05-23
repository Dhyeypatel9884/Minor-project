const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/db');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { Message, Conversation } = require('../models/Message');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Bid.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});

        console.log('🗑️  Cleared existing data.');

        // 1. Create Demo Users (password: password123)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            {
                fullName: 'Sarah Jenna',
                email: 'sarah@college.edu',
                password: hashedPassword,
                role: 'client',
                institution: 'Campus University',
                bio: 'Looking for talented students to help with creative projects.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
            },
            {
                fullName: 'Dhyey Patel',
                email: 'dhyey@college.edu',
                password: hashedPassword,
                role: 'student',
                institution: 'Campus University',
                bio: 'Full-stack developer and graphic designer with 2 years of experience.',
                skills: ['Web Development', 'Graphic Design', 'React', 'Node.js'],
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhyey'
            },
            {
                fullName: 'Priya Sharma',
                email: 'priya@college.edu',
                password: hashedPassword,
                role: 'student',
                institution: 'Campus University',
                bio: 'Content writer and SEO specialist.',
                skills: ['Content Writing', 'SEO', 'Copywriting', 'Creative Writing'],
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
            }
        ]);

        const client  = users[0]; // Sarah  — client
        const student1 = users[1]; // Dhyey  — student
        const student2 = users[2]; // Priya  — student

        console.log('👤 Created demo users.');

        // 2. Create Projects  (clientId = ObjectId, budget = Number, deadline = Date)
        const projects = await Project.insertMany([
            {
                clientId: client._id,               // ✅ correct field name
                title: 'Design a New Logo for Student Union',
                description: 'We are looking for a creative and professional graphic designer to create a modern, inclusive, and memorable logo for our student union. The logo should represent diversity and academic excellence.',
                budget: 1000,                        // ✅ Number, not string
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
                skills: ['Graphic Design', 'Branding', 'Illustration', 'Logo Design'],
                image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
                status: 'Open',
                totalBids: 1,
                client: {
                    name: client.fullName,
                    avatar: client.avatar,
                    role: 'Client',
                    verified: true
                }
            },
            {
                clientId: client._id,
                title: 'Write Articles for Campus Blog',
                description: 'Looking for talented writers to contribute engaging articles on student life, academic tips, campus events, and career advice. Each article should be 800–1200 words, SEO-friendly, and original.',
                budget: 150,                         // ✅ Number
                deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
                skills: ['Content Writing', 'Copywriting', 'SEO', 'Creative Writing'],
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
                status: 'Open',
                totalBids: 0,
                client: {
                    name: client.fullName,
                    avatar: client.avatar,
                    role: 'Client',
                    verified: true
                }
            },
            {
                clientId: client._id,
                title: 'Build a React Dashboard for College Society',
                description: 'We need a responsive React dashboard to manage events, members, and announcements for our college society. API integration with our existing backend is required.',
                budget: 3500,                        // ✅ Number
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
                skills: ['Web Development', 'React', 'Node.js', 'MongoDB'],
                image: 'https://images.unsplash.com/photo-1522071823957-09c527762297?auto=format&fit=crop&q=80&w=800',
                status: 'Open',
                totalBids: 0,
                client: {
                    name: client.fullName,
                    avatar: client.avatar,
                    role: 'Client',
                    verified: true
                }
            }
        ]);

        console.log('📂 Created demo projects.');

        // 3. Create Bids  (projectId = real ObjectId, studentId = real ObjectId)
        await Bid.insertMany([
            {
                projectId: projects[0]._id,          // ✅ real ObjectId
                projectTitle: projects[0].title,
                clientName: client.fullName,
                studentId: student1._id,             // ✅ real ObjectId
                studentName: student1.fullName,
                description: 'I have 2 years of experience designing logos for college clubs and startups. I will deliver 3 initial concepts within 2 days and revise until you are fully satisfied.',
                bidAmount: 950,
                deliveryTime: '5 days',
                status: 'Pending'
            },
            {
                projectId: projects[1]._id,
                projectTitle: projects[1].title,
                clientName: client.fullName,
                studentId: student2._id,
                studentName: student2.fullName,
                description: 'I am an experienced content writer with 50+ published articles. I specialise in SEO-friendly, engaging campus and lifestyle content.',
                bidAmount: 130,
                deliveryTime: '3 days per article',
                status: 'Pending'
            }
        ]);

        console.log('⚖️  Created demo bids.');

        // 4. Create a sample Conversation + Messages
        const conversation = await Conversation.create({
            projectId: projects[0]._id,
            projectTitle: projects[0].title,
            clientId: client._id,
            clientName: client.fullName,
            studentId: student1._id,
            studentName: student1.fullName,
            studentAvatar: student1.avatar,
            lastMessage: 'Looking forward to working with you!',
            lastMessageAt: new Date()
        });

        await Message.insertMany([
            {
                conversationId: conversation._id,
                senderId: client._id,
                senderName: client.fullName,
                senderRole: 'client',
                text: 'Hi Dhyey! I reviewed your bid and it looks great. Can you share your portfolio?',
                createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 min ago
            },
            {
                conversationId: conversation._id,
                senderId: student1._id,
                senderName: student1.fullName,
                senderRole: 'student',
                text: 'Hi Sarah! Thank you for considering my proposal. Here is my portfolio: portfolio.dhyey.dev',
                createdAt: new Date(Date.now() - 3 * 60 * 1000) // 3 min ago
            },
            {
                conversationId: conversation._id,
                senderId: client._id,
                senderName: client.fullName,
                senderRole: 'client',
                text: 'Looking forward to working with you!',
                createdAt: new Date()
            }
        ]);

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: 'Looking forward to working with you!',
            lastMessageAt: new Date()
        });

        console.log('💬 Created demo conversation and messages.');
        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Demo Login Credentials (password: password123):');
        console.log('   Client  → sarah@college.edu');
        console.log('   Student → dhyey@college.edu');
        console.log('   Student → priya@college.edu');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
