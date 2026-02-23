const Setting = require('./models/Setting');

const NEXTSMS_API_URL = 'https://nextsms.co.in/api/whatsapp/send';

/**
 * Send a WhatsApp message via NextSMS API
 * Token is fetched from the database (configurable from admin panel)
 */
async function sendMessage(phone, message, mediaUrl = '') {
    // Get token from database
    const token = await Setting.get('nextsms_token');
    if (!token) {
        console.error('❌ NextSMS API token not configured. Set it from Admin Panel → WhatsApp Settings.');
        return { success: false, error: 'WhatsApp API token not configured. Please set it in Admin Panel.' };
    }

    // Format number: ensure it starts with 91 (India)
    let receiver = phone.replace(/[^\d]/g, '');
    if (receiver.length === 10) {
        receiver = '91' + receiver;
    }
    if (receiver.startsWith('0')) {
        receiver = '91' + receiver.substring(1);
    }

    try {
        const params = new URLSearchParams({
            receiver,
            msgtext: message,
            token
        });

        if (mediaUrl) {
            params.append('mediaUrl', mediaUrl);
        }

        const url = `${NEXTSMS_API_URL}?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log(`📤 WhatsApp message sent to ${receiver}`);
            return { success: true, data };
        } else {
            console.error(`❌ NextSMS API error:`, data);
            return { success: false, error: data.message || 'Failed to send message' };
        }
    } catch (err) {
        console.error('❌ WhatsApp send error:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { sendMessage };
