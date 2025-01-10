import cloudinary from '../config/cloudinaryConfig.js';

// Utility function to upload a file to Cloudinary
export const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload failed: ${file.originalname}`, error);
          reject(new Error('File upload failed. Please try again.'));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(file.buffer);
  });
};
