const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    guildId: String,
    name: String,
    roleId: String,
    voiceId: String,
    leaderId: String,
    coLeaders: { type: [String], default: [] },
    members: { type: [String], default: [] }
});

module.exports = mongoose.model('Clan', clanSchema);