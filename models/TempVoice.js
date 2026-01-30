const mongoose = require('mongoose');

const TempVoiceSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    ownerId: String,

    managers: { type: [String], default: [] },
    whitelist: { type: [String], default: [] },
    blacklist: { type: [String], default: [] },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TempVoice', TempVoiceSchema);