import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'legacy_trunk_stories',
    resource_type: 'auto',
    public_id: `story_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
    // ❌ remove allowed_formats here to avoid false rejects
  }),
});

const fileFilter = (req, file, cb) => {
  const ok =
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('audio/');
  if (!ok) return cb(new Error('Only image/video/audio files are allowed'));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export default upload;