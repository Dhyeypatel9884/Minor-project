const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Notification = require('../models/Notification');


// @desc    Create a new bid
// @route   POST /api/bids
// @access  Private (Student)
exports.createBid = async (req, res) => {
    try {
        const { projectId, description, bidAmount, deliveryTime } = req.body;

        if (!projectId || !description || !bidAmount || !deliveryTime) {
            return res.status(400).json({ message: 'Please provide projectId, description, bidAmount, and deliveryTime' });
        }

        if (isNaN(bidAmount) || Number(bidAmount) <= 0) {
            return res.status(400).json({ message: 'Bid amount must be a positive number' });
        }

        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // --- Unverified User Restriction (Option 1) ---
        if (!req.user.isVerified) {
            const existingBidsCount = await Bid.countDocuments({ studentId: req.user._id });
            if (existingBidsCount >= 1) {
                return res.status(403).json({ message: 'You must be verified to place more than 1 bid. Please request verification from your profile.' });
            }
        }

        // Check if student already bid on this project
        const existingBid = await Bid.findOne({ projectId, studentId: req.user._id });
        if (existingBid) {
            return res.status(400).json({ message: 'You have already submitted a bid for this project' });
        }

        const bid = await Bid.create({
            projectId,
            projectTitle: project.title,
            clientName: project.client?.name || '',
            studentId: req.user._id,
            studentName: req.user.fullName,
            description,
            bidAmount: Number(bidAmount),
            deliveryTime,
            status: 'Pending'
        });

        // Increment totalBids on project
        await Project.findByIdAndUpdate(projectId, { $inc: { totalBids: 1 } });

        // Create notification for the client
        if (project.clientId) {
            await Notification.create({
                recipientId: project.clientId,
                message: `${req.user.fullName} has placed a bid on your project "${project.title}"`,
                type: 'bid_placed',
                link: '/client/bids'
            });
        }

        res.status(201).json({ success: true, bid });

    } catch (err) {
        console.error('Create bid error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted a bid for this project' });
        }
        res.status(500).json({ message: 'Server error creating bid' });
    }
};

// @desc    Get bids by student (logged-in user)
// @route   GET /api/bids/my-bids
// @access  Private (Student)
exports.getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ studentId: req.user._id })
            .populate('projectId', 'title image deadline budget')
            .sort({ createdAt: -1 });
        res.json({ success: true, bids });
    } catch (err) {
        console.error('Get my bids error:', err);
        res.status(500).json({ message: 'Server error fetching bids' });
    }
};

// @desc    Get all bids for a specific project (for client)
// @route   GET /api/bids/project/:projectId
// @access  Private (Client)
exports.getBidsForProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Verify the project belongs to this client
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view bids for this project' });
        }

        const bids = await Bid.find({ projectId }).sort({ createdAt: -1 });
        res.json({ success: true, bids });
    } catch (err) {
        console.error('Get bids for project error:', err);
        res.status(500).json({ message: 'Server error fetching bids' });
    }
};

// @desc    Get all bids across all client's projects
// @route   GET /api/bids/received
// @access  Private (Client)
exports.getReceivedBids = async (req, res) => {
    try {
        // Get all projects owned by this client
        const projects = await Project.find({ clientId: req.user._id }).select('_id title');
        const projectIds = projects.map(p => p._id);

        const bids = await Bid.find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 });
        res.json({ success: true, bids });
    } catch (err) {
        console.error('Get received bids error:', err);
        res.status(500).json({ message: 'Server error fetching bids' });
    }
};

// @desc    Update bid status (award or reject)
// @route   PUT /api/bids/:id/status
// @access  Private (Client)
exports.updateBidStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Accepted, Rejected, or Pending' });
        }

        const bid = await Bid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        // Verify the project belongs to this client
        const project = await Project.findById(bid.projectId);
        if (!project || project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this bid' });
        }

        bid.status = status;
        await bid.save();

        // If awarded, update project status
        if (status === 'Accepted') {
            await Project.findByIdAndUpdate(bid.projectId, { status: 'In Progress' });
        }

        // Create notification for the student
        await Notification.create({
            recipientId: bid.studentId,
            message: `Your bid for "${bid.projectTitle}" was ${status.toLowerCase()}`,
            type: status === 'Accepted' ? 'bid_accepted' : 'bid_rejected',
            link: '/student/my-bids'
        });

        res.json({ success: true, message: `Bid ${status.toLowerCase()} successfully`, bid });

    } catch (err) {
        console.error('Update bid status error:', err);
        res.status(500).json({ message: 'Server error updating bid' });
    }
};

// @desc    Delete/withdraw a bid
// @route   DELETE /api/bids/:id
// @access  Private (Student)
exports.deleteBid = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        if (bid.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to withdraw this bid' });
        }

        if (bid.status === 'Accepted') {
            return res.status(400).json({ message: 'Cannot withdraw an accepted bid' });
        }

        await Bid.findByIdAndDelete(req.params.id);

        // Decrement totalBids on project
        await Project.findByIdAndUpdate(bid.projectId, { $inc: { totalBids: -1 } });

        res.json({ success: true, message: 'Bid withdrawn successfully' });
    } catch (err) {
        console.error('Delete bid error:', err);
        res.status(500).json({ message: 'Server error withdrawing bid' });
    }
};
