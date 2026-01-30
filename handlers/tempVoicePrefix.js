const TempVoice = require('../models/TempVoice');
const commands = require('../tempvoice/commands');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith('.v')) return;

        const args = message.content.slice(2).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase();

        const voice = message.member.voice.channel;
        if (!voice) return;

        const data = await TempVoice.findOne({ channelId: voice.id });
        if (!data) return;

        if (commands[cmd]) {
            commands[cmd](message, args, data);
        }
    });
};