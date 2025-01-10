import multer from 'multer';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';
import path from 'path';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'your-cloud-name', // Replace with your Cloudinary cloud name
  api_key: 'your-api-key', // Replace with your Cloudinary API key
  api_secret: 'your-api-secret', // Replace with your Cloudinary API secret
});

// Multer memory storage configuration (storing files in memory as buffer)
const storage = multer.memoryStorage();

// File filter to allow specific types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', // For .jpg and .jpeg files
    'application/pdf', // For .pdf files
    'application/vnd.ms-powerpoint', // For .ppt files
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // For .pptx files
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPEG (.jpg, .jpeg), PDF, and PowerPoint (.ppt, .pptx) files are allowed.'));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: 10MB file size limit
});

// Middleware to handle file uploads
export const uploadFiles = upload.fields([
  { name: 'idOrPassport', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
  { name: 'ministryLicense', maxCount: 1 },
  { name: 'associationMembership', maxCount: 1 },
]);