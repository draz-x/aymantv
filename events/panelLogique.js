const {
    Events,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

const TempRoom = require('../models/TempRoom');

const ANNOUNCE_CHANNEL = '1465885735776288819';

const games = {
    Valorant: { limits: [2, 4, 10], roleId: '1465823453746696386' },
    'Free Fire': { limits: [1, 2, 4], roleId: '1465202011187318937' },
    'Among Us': { limits: [4, 6, 10], roleId: '1465823383341105364' }
};

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

        if (
            ['btn_games', 'btn_notifs', 'select_games', 'select_notifs']
                .includes(interaction.customId)
        ) return;

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate().catch(() => {});
        }

        // game select
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('game_')) {
            const voiceId = interaction.customId.split('_')[1];
            const game = interaction.values[0];

            await TempRoom.findOneAndUpdate(
                { voiceId },
                { game },
                { new: true }
            );

            const voice = interaction.guild.channels.cache.get(voiceId);
            if (voice) await voice.setName(`🎮・${game}`);

            const limitMenu = new StringSelectMenuBuilder()
                .setCustomId(`limit_${voiceId}`)
                .setPlaceholder('Select player limit')
                .addOptions(
                    games[game].limits.map(l => ({
                        label: `${l} Players`,
                        value: String(l)
                    }))
                );

            return interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🎮・Game Selected')
                        .setDescription(`・Selected game : **${game}**`)
                        .setColor(0xFFD700)
                ],
                components: [new ActionRowBuilder().addComponents(limitMenu)]
            });
        }

        // limit select
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('limit_')) {
            const voiceId = interaction.customId.split('_')[1];
            const limit = Number(interaction.values[0]);

            const room = await TempRoom.findOneAndUpdate(
                { voiceId },
                { limit },
                { new: true }
            );

            const voice = interaction.guild.channels.cache.get(voiceId);
            if (voice) await voice.setUserLimit(limit);

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mention_yes_${voiceId}`)
                    .setLabel('Mention Game Role')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`mention_no_${voiceId}`)
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Secondary),
            );

            return interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('⚙️・Room Ready')
                        .setDescription(`・Owner : <@${room.ownerId}>\n・Limit : **${limit} players**`)
                        .setColor(0xFFD700)
                ],
                components: [buttons]
            });
        }

        // mention button d zb
        if (interaction.isButton() && interaction.customId.startsWith('mention_')) {
            const [, choice, voiceId] = interaction.customId.split('_');

            if (choice === 'no') {
                return interaction.message.edit({ components: [] });
            }

            const room = await TempRoom.findOne({ voiceId });
            if (!room) return;

            const roleId = games[room.game].roleId;
            const channel = interaction.guild.channels.cache.get(ANNOUNCE_CHANNEL);
            const voice = interaction.guild.channels.cache.get(voiceId);

            if (channel && voice) {
                await channel.send({
                    content: `<@&${roleId}>`,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`🎮 ${room.game} Room Open`)
                            .setColor(0xFFD700)
                            .addFields(
                                { name: '👤・Owner :', value: `<@${room.ownerId}>`, inline: true },
                                { name: '🔗・Join :', value: `[Click to Join](https://discord.com/channels/${interaction.guild.id}/${voiceId})` }
                            )
                            .setFooter({ text: 'Come To Play With Me !' })
                    ]
                });
            }

            return interaction.message.edit({ components: [] });
        }
    }
};