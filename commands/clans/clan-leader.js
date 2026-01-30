const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Clan = require('../../models/Clan');

module.exports = [
    {
        name: 'add',
        async execute(client, message, args) {
            const clan = await Clan.findOne({ $or: [{ leaderId: message.author.id }, { coLeaders: message.author.id }] });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You aren\'t a Clan Leader/Co-Leader.')
                    ]
                });
            }

            const target = message.mentions.members.first();
            if (!target) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Mention a user to invite.')
                    ]
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('deny').setLabel('Decline').setStyle(ButtonStyle.Danger)
            );

            const inviteEmbed = new EmbedBuilder()
                .setTitle("🏰・Clan Invitation")
                .setDescription(`${message.author} invited you to join **${clan.name}**.\n\n⌛ *This invite expires in 30 seconds.*`)
                .setColor('Gold');

            const msg = await message.channel.send({
                content: `${target}`,
                embeds: [inviteEmbed],
                components: [row]
            });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 30000 
            });

            collector.on('collect', async (i) => {
                try {
                    if (i.user.id !== target.id) {
                        if (!i.replied && !i.deferred) {
                            return i.reply({ 
                                embeds: [new EmbedBuilder()
                                    .setColor('Red')
                                    .setDescription('❌ This invite is not for you!')
                                ],
                                ephemeral: true
                            });
                        } else return;
                    }

                    if (i.customId === 'accept') {
                        if (!clan.members.includes(target.id)) {
                            clan.members.push(target.id);
                            await clan.save();
                        }
                        await target.roles.add(clan.roleId);

                        const acceptEmbed = new EmbedBuilder()
                            .setColor('Green')
                            .setDescription(`✅ ${target} has joined the clan!`);

                        if (!i.replied && !i.deferred) {
                            await i.update({ content: null, embeds: [acceptEmbed], components: [] });
                        } else {
                            await i.followUp({ embeds: [acceptEmbed], ephemeral: true }).catch(() => null);
                        }
                        collector.stop('accepted');

                    } else if (i.customId === 'deny') {
                        const denyEmbed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('❌ Invitation declined.');

                        if (!i.replied && !i.deferred) {
                            await i.update({ content: null, embeds: [denyEmbed], components: [] });
                        } else {
                            await i.followUp({ embeds: [denyEmbed], ephemeral: true }).catch(() => null);
                        }
                        collector.stop('denied');
                    }
                } catch (err) {
                    console.error("Collector error:", err);
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    const expiredRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('exp')
                            .setLabel('Expired')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
                    msg.edit({ 
                        content: null, 
                        embeds: [new EmbedBuilder()
                            .setColor('Yellow')
                            .setDescription('⏰ Invitation expired.')
                        ],
                        components: [expiredRow] 
                    }).catch(() => null);
                }
            });
        }
    },
    {
        name: 'add-leader',
        async execute(client, message) {
            const clan = await Clan.findOne({ leaderId: message.author.id });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ Only the Owner can add Co-Leaders.')
                    ]
                });
            }

            const target = message.mentions.members.first();
            if (!target || !clan.members.includes(target.id)) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Target must be a clan member.')
                    ]
                });
            }

            if (!clan.coLeaders.includes(target.id)) {
                clan.coLeaders.push(target.id);
                await clan.save();
            }

            await target.roles.add(client.config.clanCoLeaderRoleId);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`✅ ${target} is now a Co-Leader.`)
                ]
            });
        }
    },
    {
        name: 'remove',
        async execute(client, message) {
            const clan = await Clan.findOne({ $or: [{ leaderId: message.author.id }, { coLeaders: message.author.id }] });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You aren\'t a Clan Leader/Co-Leader.')
                    ]
                });
            }

            const target = message.mentions.members.first();
            if (!target) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Mention a user to remove.')
                    ]
                });
            }

            if (target.id === clan.leaderId) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You cannot remove the Owner.')
                    ]
                });
            }

            clan.members = clan.members.filter(id => id !== target.id);
            clan.coLeaders = clan.coLeaders.filter(id => id !== target.id);
            await clan.save();

            await target.roles.remove([clan.roleId, client.config.clanCoLeaderRoleId]).catch(() => null);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`❌ Removed ${target} from the clan.`)
                ]
            });
        }
    }
];