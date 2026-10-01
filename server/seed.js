require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Preparing seed data...');

    // Clear previous seed data
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] Cleared existing records.');

    // Create User A: Abhi Kamble
    const userA = await User.create({
      name: 'Abhi Kamble',
      username: 'abhi16',
      email: 'abhi@example.com',
      password: 'password123',
      bio: 'Full Stack MERN Developer | Prodigy InfoTech Intern 🚀 Building clean web apps.',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    });

    // Create User B: Rohit Sharma
    const userB = await User.create({
      name: 'Rohit Sharma',
      username: 'rohit_dev',
      email: 'rohit@example.com',
      password: 'password123',
      bio: 'Frontend enthusiast & UI explorer. JavaScript, Tailwind CSS & Vite fan.',
      profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    });

    console.log(`[Seed] Created User A: ${userA.name} (@${userA.username})`);
    console.log(`[Seed] Created User B: ${userB.name} (@${userB.username})`);

    // Setup Follow relationship: User B follows User A
    userB.following.push(userA._id);
    userA.followers.push(userB._id);
    await userA.save();
    await userB.save();

    // Create Post 1 by User A (Image Post with hashtags)
    const post1 = await Post.create({
      author: userA._id,
      caption: 'Excited to announce my progress on Task 05 of the Prodigy InfoTech Web Development Internship! 🚀 Built with MongoDB, Express, React, and Node.js. #MERN #React #ProdigyInfoTech #WebDevelopment',
      mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      tags: ['#MERN', '#React', '#ProdigyInfoTech', '#WebDevelopment'],
      likes: [userB._id],
      comments: [],
    });

    // Create Post 2 by User B (Tech update with hashtags)
    const post2 = await Post.create({
      author: userB._id,
      caption: 'Just set up Cloudinary media uploads and clean responsive video support! Testing out the HTML5 player controls. #Cloudinary #NodeJS #JavaScript #MERN',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video',
      tags: ['#Cloudinary', '#NodeJS', '#JavaScript', '#MERN'],
      likes: [userA._id],
      comments: [],
    });

    // Add Comment on Post 1 by User B
    const comment1 = await Comment.create({
      post: post1._id,
      user: userB._id,
      text: 'Awesome work Abhi! The MERN stack architecture and Cloudinary integration look super clean. 🔥',
    });
    post1.comments.push(comment1._id);
    await post1.save();

    // Add Reply Comment on Post 1 by User A
    const comment2 = await Comment.create({
      post: post1._id,
      user: userA._id,
      text: 'Thank you Rohit! Really appreciate the feedback.',
    });
    post1.comments.push(comment2._id);
    await post1.save();

    // Add Comment on Post 2 by User A
    const comment3 = await Comment.create({
      post: post2._id,
      user: userA._id,
      text: 'The HTML5 video player works flawlessly! Great job.',
    });
    post2.comments.push(comment3._id);
    await post2.save();

    console.log('[Seed] Posts and comments seeded successfully!');
    console.log('[Seed] Completed! Both test users are ready with credentials: password123');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
