const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required']
    },
    projectTitle: {
        type: String,
        required: true
    },
    clientName: String,
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required']
    },
    studentName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: [true, 'Proposal description is required']
    },
    bidAmount: {
        type: Number,
        required: [true, 'Bid amount is required'],
        min: [1, 'Bid amount must be positive']
    },
    deliveryTime: {
        type: String,
        required: [true, 'Delivery time is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Prevent duplicate bids from same student on same project
BidSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
