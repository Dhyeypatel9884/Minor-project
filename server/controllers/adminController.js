const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');

// @desc    Get dashboard aggregated stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const clientCount = await User.countDocuments({ role: 'client' });
        
        const openProjects = await Project.countDocuments({ status: 'Open' });
        const inProgressProjects = await Project.countDocuments({ status: 'In Progress' });
        const completedProjects = await Project.countDocuments({ status: 'Completed' });
        const cancelledProjects = await Project.countDocuments({ status: 'Cancelled' });

        // Calculate total transaction volume (sum of budget for completed projects)
        const completedProjectsData = await Project.find({ status: 'Completed' });
        const totalRevenue = completedProjectsData.reduce((acc, project) => acc + (project.budget || 0), 0);

        res.json({
            success: true,
            stats: {
                users: {
                    total: studentCount + clientCount,
                    students: studentCount,
                    clients: clientCount
                },
                projects: {
                    total: openProjects + inProgressProjects + completedProjects + cancelledProjects,
                    open: openProjects,
                    inProgress: inProgressProjects,
                    completed: completedProjects,
                    cancelled: cancelledProjects
                },
                revenue: {
                    totalVolume: totalRevenue
                }
            }
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ message: 'Server error fetching admin stats' });
    }
};

// @desc    Get all users (Privacy-first: no email/phone)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getPlatformUsers = async (req, res) => {
    try {
        // Include bio, institution, skills, and verificationStatus for authenticity checks, but exclude email/password
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('fullName role avatar createdAt isVerified verificationStatus bio institution skills')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Get all projects summary
// @route   GET /api/admin/projects
// @access  Private/Admin
exports.getPlatformProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .select('title description budget status createdAt client.name skills')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching projects' });
    }
};

// @desc    Admin cancels a project
// @route   PUT /api/admin/projects/:id/cancel
// @access  Private/Admin
exports.cancelProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.status = 'Cancelled';
        await project.save();

        res.json({ success: true, message: 'Project has been cancelled by admin' });
    } catch (err) {
        res.status(500).json({ message: 'Server error cancelling project' });
    }
};

// @desc    Admin approves a user
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.verificationStatus = 'Verified';
        await user.save();

        res.json({ success: true, message: 'User approved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error approving user' });
    }
};

// @desc    Admin removes a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.removeUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error removing user' });
    }
};
