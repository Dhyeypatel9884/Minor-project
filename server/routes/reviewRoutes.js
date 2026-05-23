const express = require('express');
const router = express.Router();
const { createReview, getUserStats, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createReview);
router.get('/stats', getUserStats);
router.get('/my-reviews', getMyReviews);

module.exports = router;
