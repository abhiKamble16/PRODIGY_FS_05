const multer = require('multer');

// Store file in memory as Buffer for direct Cloudinary upload_stream
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Image formats
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Video formats
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file format. Please upload an image (JPG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV).'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB limit for media uploads
  },
  fileFilter,
});

module.exports = upload;
