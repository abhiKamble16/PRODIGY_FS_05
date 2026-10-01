const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const { uploadMedia } = require('../config/cloudinary');

// @desc    Get all users with optional search
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        $or: [{ name: regex }, { username: regex }],
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach posts count and isFollowing status for each user
    const currentUserId = req.user ? req.user._id.toString() : null;

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        const postsCount = await Post.countDocuments({ author: u._id });
        const followers = u.followers || [];
        const isFollowing = currentUserId
          ? followers.some((id) => id.toString() === currentUserId)
          : false;

        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          email: u.email,
          bio: u.bio,
          profilePicture: u.profilePicture,
          followersCount: followers.length,
          followingCount: (u.following || []).length,
          postsCount,
          isFollowing,
          createdAt: u.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile by ID or username
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id).select('-password');
    }

    if (!user) {
      user = await User.findOne({ username: id.toLowerCase().trim() }).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'name username profilePicture')
      .sort({ createdAt: -1 });

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isFollowing = currentUserId
      ? (user.followers || []).some((fid) => fid.toString() === currentUserId)
      : false;

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        postsCount: posts.length,
        isFollowing,
        createdAt: user.createdAt,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, bio, profilePicture)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const { name, bio, profilePicture } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    // Check if an image file was uploaded
    if (req.file) {
      const uploadResult = await uploadMedia(
        req.file.buffer,
        req.file.mimetype,
        'prodigy_social/avatars'
      );
      user.profilePicture = uploadResult.url;
    } else if (profilePicture !== undefined) {
      user.profilePicture = profilePicture.trim();
    }

    await user.save();

    const postsCount = await Post.countDocuments({ author: user._id });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        postsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow another user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found.',
      });
    }

    // Check if already following
    const alreadyFollowing = (currentUser.following || []).some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user.',
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      followersCount: targetUser.followers.length,
      isFollowing: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found.',
      });
    }

    currentUser.following = (currentUser.following || []).filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = (targetUser.followers || []).filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `You unfollowed ${targetUser.username}`,
      followersCount: targetUser.followers.length,
      isFollowing: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser,
};
