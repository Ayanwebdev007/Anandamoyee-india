const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

/**
 * Deletes an object from S3 given its public URL
 * @param {string} url - The full public URL of the S3 object
 */
const deleteFromS3 = async (url) => {
    if (!url || !url.includes('amazonaws.com')) return;

    try {
        // Extract the key from the URL
        // Example URL: https://bucket.s3.region.amazonaws.com/folder/filename.png
        const urlParts = new URL(url);
        const key = decodeURIComponent(urlParts.pathname.substring(1));

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`🗑️ Successfully deleted from S3: ${key}`);
    } catch (error) {
        console.error('❌ Error deleting from S3:', error);
    }
};

module.exports = { s3Client, deleteFromS3 };
