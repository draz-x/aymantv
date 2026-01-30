const TempVoice = require('../models/TempVoice');
const panel = require('../tempvoice/panel');

const JOIN_TO_CREATE_ID = '1466628061754687551';

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState, client) {
        try {
            // =====================
            // CREATE TEMP VOICE
            // =====================
            if (newState.channelId === JOIN_TO_CREATE_ID) {
                const category = newState.channel.parent;
                const member = newState.member;

                // Create temp voice channel
                const channel = await newState.guild.channels.create({
                    name: `${member.user.username}'s room`,
                    type: 2, // Voice channel
                    parent: category,
                    permissionOverwrites: category.permissionOverwrites.cache.map(p => ({
                        id: p.id,
                        allow: p.allow.bitfield,
                        deny: p.deny.bitfield
                    }))
                });

                // Move member to the new voice channel
                await member.voice.setChannel(channel);

                // Save in DB
                const data = await TempVoice.create({
                    guildId: newState.guild.id,
                    channelId: channel.id,
                    ownerId: member.id
                });

                // Generate panel embed + buttons
                const { embed, row } = panel(data);

                // ⚠ NOTE: Discord API does NOT allow sending messages in voice channels.
                // If you really want to "send in the VC", this will fail. You need a linked text channel.
                // For demonstration, I'll keep your code as-is:
                if (channel.isTextBased()) { // safety check
                    await channel.send({ embeds: [embed], components: [row] });
                }
            }

            // =====================
            // DELETE EMPTY TEMP VOICE
            // =====================
            if (oldState.channel && oldState.channel.members.size === 0) {
                const data = await TempVoice.findOne({ channelId: oldState.channel.id });
                if (data) {
                    await TempVoice.deleteOne({ channelId: oldState.channel.id });
                    await oldState.channel.delete().catch(() => {});
                }
            }
        } catch (err) {
            console.error('Temp Voice Error:', err);
        }
    }
};