const Review = require('../models/Review');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Client)
exports.createReview = async (req, res) => {
    try {
        const { projectId, revieweeId, rating, comment } = req.body;

        if (!projectId || !revieweeId || !rating) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify project ownership
        const project = await Project.findById(projectId);
        if (!project || project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review for this project' });
        }

        // Create review
        const review = await Review.create({
            projectId,
            reviewerId: req.user._id,
            revieweeId,
            rating: Number(rating),
            comment
        });

        // Notify student
        await Notification.create({
            recipientId: revieweeId,
            message: `${req.user.fullName} left a ${rating}-star review on your profile.`,
            type: 'review_received',
            link: '/profile'
        });

        res.status(201).json({ success: true, review });
    } catch (err) {
        console.error('Create review error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this student for this project' });
        }
        res.status(500).json({ message: 'Server error creating review' });
    }
};

// @desc    Get stats for a user (Success Rate, Average Rating)
// @route   GET /api/reviews/stats
// @access  Private
exports.getUserStats = async (req, res) => {
    try {
        // Find reviews where the current user is the reviewee
        const reviews = await Review.find({ revieweeId: req.user._id });
        
        if (reviews.length === 0) {
            return res.json({ 
                success: true, 
                stats: { averageRating: 0, successRate: 0, totalReviews: 0 } 
            });
        }

        const totalReviews = reviews.length;
        const sumRatings = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = (sumRatings / totalReviews).toFixed(1);
        
        // Success rate: percentage of reviews that are 4 or 5 stars
        const successfulReviews = reviews.filter(rev => rev.rating >= 4).length;
        const successRate = Math.round((successfulReviews / totalReviews) * 100);

        res.json({ 
            success: true, 
            stats: { 
                averageRating: Number(averageRating), 
                successRate, 
                totalReviews 
            } 
        });
    } catch (err) {
        console.error('Get user stats error:', err);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// @desc    Get all reviews for the current user
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ revieweeId: req.user._id })
            .populate('reviewerId', 'fullName avatar')
            .populate('projectId', 'title')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        console.error('Get my reviews error:', err);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};
