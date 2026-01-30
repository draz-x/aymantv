const mongoose = require('mongoose');

const tempRoomSchema = new mongoose.Schema({
    guildId: String,
    voiceId: String,
    ownerId: String,
    game: { type: String, default: null },
    blocked: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('TempRoom', tempRoomSchema);