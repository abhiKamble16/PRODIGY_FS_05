const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary credentials from environment variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Configured successfully with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Credentials not fully set in .env. Using local storage fallback for uploads.');
}

/**
 * Uploads a buffer directly to Cloudinary or falls back to local storage if credentials missing.
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} mimetype - File mimetype (e.g. image/jpeg, video/mp4)
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<{ url: string, resourceType: string, publicId: string }>}
 */
const uploadMedia = (buffer, mimetype, folder = 'prodigy_social') => {
  return new Promise((resolve, reject) => {
    const isVideo = mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    if (isCloudinaryConfigured) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(new Error('Cloudinary upload failed: ' + error.message));
          }
          resolve({
            url: result.secure_url || result.url,
            resourceType,
            publicId: result.public_id,
          });
        }
      );

      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    } else {
      // Local fallback for seamless offline testing
      try {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = isVideo ? '.mp4' : '.jpg';
        const filename = `${folder}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fileUrl = `${baseUrl}/uploads/${filename}`;

        resolve({
          url: fileUrl,
          resourceType,
          publicId: filename,
        });
      } catch (err) {
        reject(new Error('Local media storage fallback failed: ' + err.message));
      }
    }
  });
};

module.exports = {
  cloudinary,
  uploadMedia,
  isCloudinaryConfigured,
};
