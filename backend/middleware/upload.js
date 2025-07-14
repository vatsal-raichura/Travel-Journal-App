require('dotenv').config();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '✔' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✔' : '❌'
});

// ✅ Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'TravelJournalImages',
    // allowed_formats: ['jpg', 'png', 'jpeg'],
    // transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});


console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '✔' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✔' : '❌'
});



const upload = multer({ storage });

module.exports = upload;
