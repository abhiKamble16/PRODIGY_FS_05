const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getAllUsers);
router.get('/:id', optionalAuth, getUserById);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;
