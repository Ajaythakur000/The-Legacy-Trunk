import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Cloudinary ko humare .env file waale credentials ke saath configure karna
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;