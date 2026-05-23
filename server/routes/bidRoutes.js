const express = require('express');
const router = express.Router();
const {
    createBid,
    getMyBids,
    getBidsForProject,
    getReceivedBids,
    updateBidStatus,
    deleteBid
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

// Student routes
router.post('/', protect, createBid);
router.get('/my-bids', protect, getMyBids);
router.delete('/:id', protect, deleteBid);

// Client routes
router.get('/received', protect, getReceivedBids);
router.get('/project/:projectId', protect, getBidsForProject);
router.put('/:id/status', protect, updateBidStatus);

module.exports = router;
