const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Clan = require('../../models/Clan');

module.exports = [
    {
        name: 'create-clan',
        async execute(client, message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need **Administrator** permissions to use this command.')
                    ]
                });
            }

            const leader = message.mentions.members.first();
            if (!leader) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Usage: `!create-clan <name> <@leader>`')
                    ]
                });
            }

            const mentionIndex = args.findIndex(a => a.includes(leader.id.replace(/\D/g, '')));
            const name = args.slice(0, mentionIndex).join(' ').trim();
            if (!name) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ You must provide a valid clan name.')
                    ]
                });
            }

            const existingClan = await Clan.findOne({ leaderId: leader.id });
            if (existingClan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`❌ <@${leader.id}> is already a leader of the clan **${existingClan.name}**.`)
                    ]
                });
            }

            const role = await message.guild.roles.create({ name });
            const voice = await message.guild.channels.create({
                name,
                type: ChannelType.GuildVoice,
                parent: client.config.clanCategoryId,
                permissionOverwrites: [
                    { id: message.guild.id, deny: [PermissionFlagsBits.Connect] },
                    { id: role.id, allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] }
                ]
            });

            await Clan.create({
                guildId: message.guild.id,
                name,
                roleId: role.id,
                voiceId: voice.id,
                leaderId: leader.id,
                members: [leader.id]
            });

            await leader.roles.add([role.id, client.config.clanLeaderRoleId]);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`✅ Clan **${name}** successfully created for <@${leader.id}>.`)
                ]
            });
        }
    },
    {
        name: 'delete-clan',
        async execute(client, message, args) {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You need **Administrator** permissions to use this command.')
                    ]
                });
            }

            const targetLeader = message.mentions.members.first();
            if (!targetLeader) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Please mention the leader of the clan to delete.')
                    ]
                });
            }

            const clan = await Clan.findOne({ leaderId: targetLeader.id });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ No clan found for this leader.')
                    ]
                });
            }

            try {
                await targetLeader.roles.remove([clan.roleId, client.config.clanLeaderRoleId]).catch(() => null);

                for (const coId of clan.coLeaders || []) {
                    const coMember = await message.guild.members.fetch(coId).catch(() => null);
                    if (coMember) await coMember.roles.remove([clan.roleId, client.config.clanCoLeaderRoleId]).catch(() => null);
                }

                const role = message.guild.roles.cache.get(clan.roleId);
                const voice = message.guild.channels.cache.get(clan.voiceId);
                if (role) await role.delete().catch(() => null);
                if (voice) await voice.delete().catch(() => null);

                await Clan.deleteOne({ _id: clan._id });

                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`🗑️ Clan **${clan.name}** has been fully deleted and roles removed.`)
                    ]
                });

            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ An error occurred while deleting the clan.')
                    ]
                });
            }
        }
    },
    {
        name: 'clans',
        async execute(client, message) {
            const clans = await Clan.find({ guildId: message.guild.id });
            if (!clans.length) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ There are no clans in this server yet.')
                    ]
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("📜・Server Clans :")
                .setColor('Gold')
                .setDescription(`・Total Clans : ${clans.length}`);

            clans.forEach(c => {
                embed.addFields({
                    name: c.name,
                    value: `・Leader : <@${c.leaderId}> | ・Members : ${c.members.length}`,
                    inline: false
                });
            });

            return message.reply({ embeds: [embed] });
        }
    }
];