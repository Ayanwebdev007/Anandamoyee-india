const express = require('express');
const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const { s3Client } = require('../config/s3Config');
const path = require('path');

const router = express.Router();

// Multer setup to store files in memory before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed!'));
    },
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const folder = process.env.AWS_S3_FOLDER || 'uploads';
        const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
        const key = `${folder}/${fileName}`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const parallelUploads3 = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        const response = await parallelUploads3.done();

        // We manually construct the public URL as before, but encode path parts for safety
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key.split('/').map(part => encodeURIComponent(part)).join('/')}`;

        console.log('✅ File uploaded successfully to S3');
        console.log('🔗 Generated URL:', url);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            url: url
        });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ message: 'Error uploading image to S3', error: error.message });
    }
});

module.exports = router;
