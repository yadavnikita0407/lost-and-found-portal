const cloudinary = require('../config/cloudinary');
const path = require('path');

/**
 * Upload a file buffer to Cloudinary (or local disk in dev mode).
 * @param {Buffer} buffer    - File buffer from Multer memoryStorage
 * @param {string} mimetype  - MIME type of the file
 * @param {string} [folder]  - Cloudinary folder name
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, mimetype, folder = 'lost-and-found') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: mimetype === 'image/png' ? 'png' : 'jpg',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
