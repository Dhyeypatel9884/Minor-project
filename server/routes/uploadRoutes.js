const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

// @desc    Upload avatar to Cloudinary and update user profile
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        // Upload to Cloudinary
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'avatars', transformation: [{ width: 250, height: 250, crop: 'fill' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(fileBuffer);
            });
        };

        const avatarUrl = await uploadToCloudinary(req.file.buffer);

        // Update user's avatar in the database
        await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

        res.json({ success: true, avatarUrl });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
});

module.exports = router;
