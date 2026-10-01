const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { uploadMedia } = require('../config/cloudinary');

// Helper to extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  // Normalize by keeping original case or capitalized, deduplicate
  const uniqueTags = Array.from(new Set(matches.map((tag) => tag.trim())));
  return uniqueTags;
};

// @desc    Get all posts (newest first, optional tag/user filter)
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res, next) => {
  try {
    const { tag, user } = req.query;
    let filter = {};

    if (tag) {
      // Support searching with or without '#'
      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
      filter.tags = cleanTag;
    }

    if (user) {
      if (mongoose.Types.ObjectId.isValid(user)) {
        filter.author = user;
      } else {
        const foundUser = await User.findOne({ username: user.toLowerCase().trim() });
        if (foundUser) {
          filter.author = foundUser._id;
        } else {
          return res.status(200).json({ success: true, count: 0, posts: [] });
        }
      }
    }

    const posts = await Post.find(filter)
      .populate('author', 'name username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name username profilePicture',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name username profilePicture',
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { caption, tags: manualTags } = req.body;

    if (!caption && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a caption or media file (image/video).',
      });
    }

    // Extract hashtags from caption
    const extractedTags = extractHashtags(caption);

    // Merge with any manual tags if provided
    let combinedTags = [...extractedTags];
    if (manualTags) {
      const parsedManual = Array.isArray(manualTags)
        ? manualTags
        : manualTags.split(',').map((t) => (t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`));
      combinedTags = Array.from(new Set([...combinedTags, ...parsedManual]));
    }

    let mediaUrl = '';
    let mediaType = 'none';

    // Handle file upload if present
    if (req.file) {
      const uploadResult = await uploadMedia(
        req.file.buffer,
        req.file.mimetype,
        'prodigy_social/posts'
      );
      mediaUrl = uploadResult.url;
      mediaType = uploadResult.resourceType; // 'image' or 'video'
    }

    const post = await Post.create({
      author: req.user._id,
      caption: caption ? caption.trim() : '',
      mediaUrl,
      mediaType,
      tags: combinedTags,
      likes: [],
      comments: [],
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username profilePicture'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    // Check post ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.',
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: post._id });

    // Delete the post
    await Post.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this post.',
        likes: post.likes,
        likeCount: post.likes.length,
      });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post liked!',
      likes: post.likes,
      likeCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const userIdStr = req.user._id.toString();
    const liked = post.likes.some((id) => id.toString() === userIdStr);

    if (!liked) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this post yet.',
        likes: post.likes,
        likeCount: post.likes.length,
      });
    }

    post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post unliked.',
      likes: post.likes,
      likeCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending hashtags
// @route   GET /api/posts/tags/trending
// @access  Public
const getTrendingTags = async (req, res, next) => {
  try {
    const result = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      tags: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  getTrendingTags,
};
