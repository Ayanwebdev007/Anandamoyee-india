const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Helper to get a setting by key
settingsSchema.statics.get = async function (key) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : null;
};

// Helper to set a setting by key
settingsSchema.statics.set = async function (key, value) {
    return this.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('Setting', settingsSchema);
