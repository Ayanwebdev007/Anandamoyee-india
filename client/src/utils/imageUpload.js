// ImgBB requires the API key to be sent with every request
const IMGBB_API_KEY = '225b25aa4bbc28749230c27e80823c8b';

/**
 * Uploads an image file to ImgBB and returns the permanent URL.
 * @param {File} file - The image file from an input field.
 * @returns {Promise<string|null>} - The URL of the hosted image, or null if it failed.
 */
export const uploadToImgBB = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url; // The permanent URL to the image
        } else {
            console.error('ImgBB Upload Error:', data.error.message);
            return null;
        }
    } catch (error) {
        console.error('Failed to upload image to ImgBB:', error);
        return null;
    }
};
