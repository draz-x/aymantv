const { EmbedBuilder } = require('discord.js');
const Clan = require('../../models/Clan');

module.exports = [
    {
        name: 'my-clan',
        async execute(client, message) {
            const clan = await Clan.findOne({ members: message.author.id });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ No clan found.')
                    ]
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏰・Clan : ${clan.name}`)
                .addFields(
                    { name: '・Leader :', value: `<@${clan.leaderId}>` },
                    { name: '・Members :', value: clan.members.map(m => `<@${m}>`).join(', ') }
                )
                .setColor('Gold');

            return message.reply({ embeds: [embed] });
        }
    },
    {
        name: 'leave',
        async execute(client, message) {
            const clan = await Clan.findOne({ members: message.author.id });
            if (!clan) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You are not in a clan.')
                    ]
                });
            }

            if (clan.leaderId === message.author.id) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Yellow')
                        .setDescription('⚠️ Leaders cannot leave the clan.')
                    ]
                });
            }

            clan.members = clan.members.filter(id => id !== message.author.id);
            clan.coLeaders = clan.coLeaders.filter(id => id !== message.author.id);
            await clan.save();

            await message.member.roles.remove([clan.roleId, client.config.clanCoLeaderRoleId]).catch(() => null);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('👋 You left the clan.')
                ]
            });
        }
    }
];