const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (!['student', 'client'].includes(role)) {
            return res.status(400).json({ message: 'Role must be student or client' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const emailLower = email.toLowerCase();
        let isVerified = false;
        let verificationStatus = 'None';
        let institution = '';

        // Auto-verify academic emails
        if (emailLower.endsWith('.edu') || emailLower.endsWith('.ac.in') || emailLower.endsWith('.edu.in')) {
            isVerified = true;
            verificationStatus = 'Verified';
            institution = emailLower.split('@')[1]; // Set institution to domain name temporarily
        }

        user = await User.create({
            fullName,
            email: emailLower,
            password: hashedPassword,
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
            isVerified,
            verificationStatus,
            institution
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                walletBalance: user.walletBalance,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                institution: user.institution
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Please provide email, password, and role' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: `This account is registered as a ${user.role}, not a ${role}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                walletBalance: user.walletBalance,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                institution: user.institution
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone || '',
                institution: user.institution || '',
                bio: user.bio || '',
                skills: user.skills || [],
                walletBalance: user.walletBalance,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, institution, bio, skills } = req.body;

        const updateFields = {};
        if (fullName) updateFields.fullName = fullName;
        if (phone !== undefined) updateFields.phone = phone;
        if (institution !== undefined) updateFields.institution = institution;
        if (bio !== undefined) updateFields.bio = bio;
        if (skills !== undefined) updateFields.skills = skills;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone || '',
                institution: user.institution || '',
                bio: user.bio || '',
                skills: user.skills || [],
                walletBalance: user.walletBalance,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Request profile verification
// @route   PUT /api/auth/profile/request-verification
// @access  Private
exports.requestVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.bio || !user.institution || (user.role === 'student' && (!user.skills || user.skills.length === 0))) {
            const msg = user.role === 'student' 
                ? 'You must complete your bio, institution, and skills to request verification.' 
                : 'You must complete your bio and institution to request verification.';
            return res.status(400).json({ message: msg });
        }

        user.verificationStatus = 'Pending';
        await user.save();

        res.json({ success: true, message: 'Verification requested successfully. An admin will review your profile shortly.' });
    } catch (err) {
        console.error('Request verification error:', err);
        res.status(500).json({ message: 'Server error requesting verification' });
    }
};
