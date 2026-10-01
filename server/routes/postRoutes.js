const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getTrendingTags,
} = require('../controllers/postController');
const {
  getPostComments,
  addComment,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Trending tags route (must come before /:id)
router.get('/tags/trending', getTrendingTags);

// Post CRUD
router.get('/', optionalAuth, getAllPosts);
router.post('/', protect, upload.single('media'), createPost);
router.get('/:id', optionalAuth, getPostById);
router.delete('/:id', protect, deletePost);

// Like / Unlike routes (exactly as required by prompt)
router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);

// Comments for post routes
router.get('/:id/comments', optionalAuth, getPostComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
