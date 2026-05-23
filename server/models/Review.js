const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Prevent multiple reviews from the same client for the same project/student
ReviewSchema.index({ projectId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
