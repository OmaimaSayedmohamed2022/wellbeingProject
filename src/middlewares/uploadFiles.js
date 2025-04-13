import multer from 'multer';

const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PDF, PPT, PPTX.'));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

export const uploadFiles = upload.fields([
  { name: 'idOrPassport', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
  { name: 'ministryLicense', maxCount: 1 },
  { name: 'associationMembership', maxCount: 1 }
]);