import {uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';

const uploadImageMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    // Upload the file to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file);
    req.body.imageUrl = imageUrl; // Store the Cloudinary URL in `req.body`

    next(); // Move to the next middleware/controller
  } catch (error) {
    console.error('Error uploading image:', error.message || error);
    res.status(500).json({ message: 'Image upload failed. Please try again.' });
  }
};

export default uploadImageMiddleware;
