// Image upload utility for AWS S3

/**
 * Uploads an image file to our backend server, which forwards it to AWS S3.
 * @param {File} file - The image file from an input field.
 * @returns {Promise<string|null>} - The URL of the hosted image, or null if it failed.
 */
export const uploadToS3 = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    try {
        // We now call our own backend instead of ImgBB directly
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.url; // The permanent S3 URL to the image
        } else {
            console.error('S3 Upload Error:', data.message || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error('Failed to upload image to S3:', error);
        return null;
    }
};
