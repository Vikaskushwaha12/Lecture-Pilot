import multer from 'multer';
import path from 'path';
import { AppError } from './error.middleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, this would stream directly to S3/Cloud Storage
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'audio/mpeg', 'audio/wav'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only video and audio files are allowed.', 400), false);
  }
};

export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});