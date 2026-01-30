const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'user',
    async execute(client, message, args) {
        const member = message.mentions.members.first() || message.member;

        const embed = new EmbedBuilder()
            .setTitle(`User Info : ${member.user.username}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '・Joined Server :', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '・Created Account :', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '・Roles :', value: member.roles.cache.map(r => r).join(' ').replace('@everyone', '') || 'None' }
            )
            .setColor('Gold');

        message.reply({ embeds: [embed] });
    }
};