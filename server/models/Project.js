const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [1, 'Budget must be positive']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    skills: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'In Review', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    submission: {
        link: { type: String, default: '' },
        notes: { type: String, default: '' },
        submittedAt: { type: Date }
    },
    client: {
        name: String,
        avatar: String,
        role: String,
        verified: Boolean
    },
    totalBids: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
