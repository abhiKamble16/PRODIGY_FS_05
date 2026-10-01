const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get all comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text: text.trim(),
    });

    // Add comment reference to post
    post.comments.push(comment._id);
    await post.save();

    // Populate user details for immediate client display
    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name username profilePicture'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: populatedComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author or Post author)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const post = await Post.findById(comment.post);

    // Only comment author or post author can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    // Remove reference from post if post exists
    if (post) {
      post.comments = post.comments.filter(
        (cid) => cid.toString() !== comment._id.toString()
      );
      await post.save();
    }

    await Comment.findByIdAndDelete(comment._id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
      commentId: comment._id,
      commentCount: post ? post.comments.length : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPostComments,
  addComment,
  deleteComment,
};
