const {
    ChannelType,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const TempRoom = require('../models/TempRoom');

const LOBBY_VOICE = '1465823704498831533';
const CATEGORY_ID = '1465823667819647170';

const games = {
    Valorant: { limits: [2, 4, 10], roleId: '1465823453746696386' },
    'Free Fire': { limits: [1, 2, 4], roleId: '1465202011187318937' },
    'Among Us': { limits: [4, 6, 10], roleId: '1465823383341105364' }
};

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState) {
        const member = newState.member;
        const guild = newState.guild;

        if (oldState.channelId) {
            const room = await TempRoom.findOne({ voiceId: oldState.channelId });
            if (room) {
                const channel = guild.channels.cache.get(oldState.channelId);
                if (!channel) return;
                if (channel.members.size === 0) {
                    await channel.delete().catch(() => {});
                    await TempRoom.deleteOne({ voiceId: oldState.channelId });
                }
            }
        }

        if (newState.channelId) {
            const room = await TempRoom.findOne({ voiceId: newState.channelId });
            if (room && room.blocked.includes(member.id)) {
                return member.voice.disconnect();
            }
        }

        if (newState.channelId !== LOBBY_VOICE) return;

        const voice = await guild.channels.create({
            name: `⏳・${member.user.username}`,
            type: ChannelType.GuildVoice,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        await member.voice.setChannel(voice);

        await TempRoom.create({
            guildId: guild.id,
            voiceId: voice.id,
            ownerId: member.id
        });

        const embed = new EmbedBuilder()
            .setTitle('🎮・Choose Your Game')
            .setDescription('Select the game you want to play')
            .setColor(0xFFD700);

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`game_${voice.id}`)
            .setPlaceholder('Select game')
            .addOptions(
                Object.keys(games).map(g => ({ label: g, value: g }))
            );

        await voice.send({
            content: `<@${member.id}>`,
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    }
};