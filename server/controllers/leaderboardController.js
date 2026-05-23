const User = require('../models/User');
const Review = require('../models/Review');
const Bid = require('../models/Bid');
const Project = require('../models/Project');

// @desc    Get student leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        
        const leaderboard = await Promise.all(students.map(async (student) => {
            let points = 0;
            let completedProjectsCount = 0;

            // 1. Points for Verification (+15)
            if (student.isVerified) {
                points += 15;
            }

            // 2. Points for Reviews
            const reviews = await Review.find({ revieweeId: student._id });
            let totalRating = 0;
            reviews.forEach(review => {
                totalRating += review.rating;
                if (review.rating === 5) points += 20;
                else if (review.rating === 4) points += 10;
                else if (review.rating === 3) points += 5;
            });
            const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            // 3. Points for Completed Projects (+50)
            const acceptedBids = await Bid.find({ studentId: student._id, status: 'Accepted' });
            if (acceptedBids.length > 0) {
                const projectIds = acceptedBids.map(bid => bid.projectId);
                const completedProjects = await Project.find({
                    _id: { $in: projectIds },
                    status: 'Completed'
                });
                completedProjectsCount = completedProjects.length;
                points += (completedProjectsCount * 50);
            }

            return {
                _id: student._id,
                fullName: student.fullName,
                avatar: student.avatar,
                institution: student.institution,
                skills: student.skills,
                isVerified: student.isVerified,
                points,
                completedProjectsCount,
                averageRating,
                totalReviews: reviews.length
            };
        }));

        // Sort descending by points
        leaderboard.sort((a, b) => b.points - a.points);

        res.json({ success: true, leaderboard });
    } catch (err) {
        console.error('Get leaderboard error:', err);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
};
