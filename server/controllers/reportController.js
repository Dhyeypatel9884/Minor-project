const Report = require('../models/Report');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Conversation, Message } = require('../models/Message');

exports.createReport = async (req, res) => {
    try {
        const { reason } = req.body;
        const projectId = req.params.projectId;
        const reporterId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        let reportedUserId;

        if (req.user.role === 'client') {
            if (project.clientId.toString() !== reporterId.toString()) {
                return res.status(403).json({ message: 'Not your project' });
            }
            const acceptedBid = await Bid.findOne({ projectId, status: 'Accepted' });
            if (!acceptedBid) return res.status(400).json({ message: 'No student assigned to this project' });
            reportedUserId = acceptedBid.studentId;
        } else if (req.user.role === 'student') {
            const acceptedBid = await Bid.findOne({ projectId, studentId: reporterId, status: 'Accepted' });
            if (!acceptedBid) return res.status(403).json({ message: 'You are not assigned to this project' });
            reportedUserId = project.clientId;
        } else {
            return res.status(403).json({ message: 'Invalid role for reporting' });
        }

        const report = await Report.create({
            projectId,
            reporterId,
            reportedUserId,
            reason
        });

        res.status(201).json({ success: true, report, message: 'Report submitted successfully. Admin will review it shortly.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error submitting report' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('projectId', 'title budget status')
            .populate('reporterId', 'fullName role')
            .populate('reportedUserId', 'fullName role')
            .sort({ createdAt: -1 });
        res.json({ success: true, reports });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching reports' });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { action, notes } = req.body;
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: 'Report not found' });
        if (report.status === 'Resolved') return res.status(400).json({ message: 'Already resolved' });

        const project = await Project.findById(report.projectId);
        const reporter = await User.findById(report.reporterId);
        const reportedUser = await User.findById(report.reportedUserId);

        if (!project || !reporter || !reportedUser) {
            return res.status(400).json({ message: 'Associated data missing' });
        }

        // Handle execution actions
        if (action === 'Refund Client') {
            // Client is refunded, project cancelled
            project.status = 'Cancelled';
            await project.save();
            const client = project.clientId.toString() === reporter._id.toString() ? reporter : reportedUser;
            client.walletBalance += project.budget;
            await client.save();
        } else if (action === 'Force Pay Student') {
            // Student gets paid, project completed
            project.status = 'Completed';
            await project.save();
            const student = project.clientId.toString() === reporter._id.toString() ? reportedUser : reporter;
            student.walletBalance += project.budget;
            await student.save();
        } else if (action === 'Ban User') {
            // Remove offending user
            await User.findByIdAndDelete(report.reportedUserId);
            project.status = 'Cancelled';
            await project.save();
        }

        // Mark report resolved
        report.status = 'Resolved';
        report.resolutionAction = action;
        report.resolutionNotes = notes;
        await report.save();

        // Send notifications
        await Notification.create({
            recipientId: report.reporterId,
            type: 'dispute_resolved',
            message: `Your dispute for project "${project.title}" was resolved. Action: ${action}. Notes: ${notes}`
        });

        // If not banned, notify reported user
        if (action !== 'Ban User') {
            await Notification.create({
                recipientId: report.reportedUserId,
                type: 'dispute_resolved',
                message: `A dispute involving you for project "${project.title}" was resolved. Action: ${action}. Notes: ${notes}`
            });
        }

        res.json({ success: true, message: 'Report resolved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error resolving report' });
    }
};

exports.adminMessageProject = async (req, res) => {
    try {
        const { projectId, text } = req.body;
        const conversation = await Conversation.findOne({ projectId });
        
        if (!conversation) {
            return res.status(404).json({ message: 'No active conversation found for this project' });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            senderName: 'Platform Admin',
            senderRole: 'admin',
            text
        });

        conversation.lastMessage = text;
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        // Notify both student and client
        await Notification.create([
            { recipientId: conversation.clientId, type: 'new_message', message: `Admin sent a message regarding project "${conversation.projectTitle}"`, link: `/messages` },
            { recipientId: conversation.studentId, type: 'new_message', message: `Admin sent a message regarding project "${conversation.projectTitle}"`, link: `/messages` }
        ]);

        res.json({ success: true, message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending admin message' });
    }
};
