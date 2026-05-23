const Project = require('../models/Project');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// @desc    Get all open projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: { $ne: 'Cancelled' } }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching projects' });
    }
};

// @desc    Get client's own projects
// @route   GET /api/projects/my-projects
// @access  Private (Client)
exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ clientId: req.user._id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching your projects' });
    }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).lean();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Find accepted bid if it exists
        const Bid = require('../models/Bid');
        const acceptedBid = await Bid.findOne({ projectId: project._id, status: 'Accepted' }).lean();
        if (acceptedBid) {
            project.acceptedBid = acceptedBid;
        }

        res.json(project);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(500).json({ message: 'Server error fetching project' });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Client)
exports.createProject = async (req, res) => {
    try {
        let { title, description, budget, deadline, skills } = req.body;

        // Validation
        if (!title || !description || !budget || !deadline) {
            return res.status(400).json({ message: 'Title, description, budget, and deadline are required' });
        }

        if (isNaN(budget) || Number(budget) <= 0) {
            return res.status(400).json({ message: 'Budget must be a positive number' });
        }

        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({ message: 'Invalid deadline date' });
        }

        // --- Unverified User Restriction (Option 1) ---
        if (!req.user.isVerified) {
            const existingProjectsCount = await Project.countDocuments({ clientId: req.user._id });
            if (existingProjectsCount >= 1) {
                return res.status(403).json({ message: 'You must be verified to post more than 1 project. Please request verification from your profile.' });
            }
        }

        // Parse skills
        let processedSkills = [];
        if (skills) {
            if (typeof skills === 'string') {
                processedSkills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
            } else if (Array.isArray(skills)) {
                processedSkills = skills;
            }
        }

        // Upload image to Cloudinary if provided
        let imageUrl = '';
        if (req.file) {
            const uploadToCloudinary = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'projects' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(fileBuffer);
                });
            };
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        const projectData = {
            clientId: req.user._id,
            title,
            description,
            budget: Number(budget),
            deadline: deadlineDate,
            skills: processedSkills,
            image: imageUrl,
            status: 'Open',
            client: {
                name: req.user.fullName,
                avatar: req.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.user.fullName)}`,
                role: 'Client',
                verified: true
            }
        };

        const project = await Project.create(projectData);
        res.status(201).json(project);
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ message: 'Server error creating project' });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Client - owner only)
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this project' });
        }

        const { title, description, budget, deadline, skills, status } = req.body;

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (budget) updateFields.budget = Number(budget);
        if (deadline) updateFields.deadline = new Date(deadline);
        if (skills !== undefined) {
            if (typeof skills === 'string') {
                updateFields.skills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
            } else if (Array.isArray(skills)) {
                updateFields.skills = skills;
            }
        }
        if (status) updateFields.status = status;

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // --- Wallet Flow: If project marked as Completed ---
        if (status === 'Completed' && project.status !== 'Completed') {
            const Bid = require('../models/Bid');
            const User = require('../models/User');
            const Notification = require('../models/Notification');

            // Find the accepted bid for this project
            const winningBid = await Bid.findOne({ projectId: project._id, status: 'Accepted' });
            
            if (winningBid) {
                // Add funds to student's wallet
                const student = await User.findById(winningBid.studentId);
                if (student) {
                    student.walletBalance = (student.walletBalance || 0) + winningBid.bidAmount;
                    await student.save();

                    // Create Notification for Student
                    await Notification.create({
                        recipientId: student._id,
                        type: 'Bid Accepted', // Using an existing type for green UI color
                        title: 'Project Completed! 🎉',
                        message: `Client marked "${project.title}" as completed. ₹${winningBid.bidAmount} has been added to your wallet!`,
                        link: '/dashboard'
                    });
                }
            }
        }

        res.json({ success: true, project: updated });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ message: 'Server error updating project' });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Client - owner only)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(req.params.id);

        // Also clean up bids for this project
        const Bid = require('../models/Bid');
        await Bid.deleteMany({ projectId: req.params.id });

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ message: 'Server error deleting project' });
    }
};

// @desc    Submit final work for a project
// @route   POST /api/projects/:id/submit
// @access  Private (Student)
exports.submitProjectWork = async (req, res) => {
    try {
        const { link, notes } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.status !== 'In Progress') {
            return res.status(400).json({ message: 'Project is not in progress' });
        }

        // Verify the student is the one awarded the project
        const Bid = require('../models/Bid');
        const winningBid = await Bid.findOne({ projectId: project._id, status: 'Accepted' });
        
        if (!winningBid || winningBid.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to submit work for this project' });
        }

        project.submission = {
            link,
            notes,
            submittedAt: new Date()
        };
        project.status = 'In Review';
        await project.save();

        // Create Notification for Client
        const Notification = require('../models/Notification');
        await Notification.create({
            recipientId: project.clientId,
            type: 'project_update',
            title: 'Work Submitted! 📦',
            message: `${req.user.fullName} has submitted the final work for "${project.title}". Please review it.`,
            link: `/project-details/${project._id}`
        });

        res.json({ success: true, message: 'Work submitted successfully', project });
    } catch (err) {
        console.error('Submit work error:', err);
        res.status(500).json({ message: 'Server error submitting work' });
    }
};

// @desc    Approve submitted work and release payment
// @route   PUT /api/projects/:id/approve
// @access  Private (Client)
exports.approveProjectWork = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to approve this project' });
        }

        if (project.status !== 'In Review') {
            return res.status(400).json({ message: 'Project is not waiting for review' });
        }

        project.status = 'Completed';
        await project.save();

        // --- Wallet Flow: Transfer Escrow to Student ---
        const Bid = require('../models/Bid');
        const User = require('../models/User');
        const Notification = require('../models/Notification');

        const winningBid = await Bid.findOne({ projectId: project._id, status: 'Accepted' });
        
        if (winningBid) {
            const student = await User.findById(winningBid.studentId);
            if (student) {
                student.walletBalance = (student.walletBalance || 0) + winningBid.bidAmount;
                await student.save();

                await Notification.create({
                    recipientId: student._id,
                    type: 'project_update',
                    title: 'Work Approved! 🎉',
                    message: `Client approved your work for "${project.title}". ₹${winningBid.bidAmount} has been added to your wallet!`,
                    link: '/dashboard'
                });
            }
        }

        res.json({ success: true, message: 'Work approved and payment released', project });
    } catch (err) {
        console.error('Approve work error:', err);
        res.status(500).json({ message: 'Server error approving work' });
    }
};

