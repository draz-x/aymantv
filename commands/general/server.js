const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'server',
    execute(client, message) {
        const { guild } = message;
        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Info`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '・Owner :', value: `<@${guild.ownerId}>`, inline: true },
                { name: '・Members :', value: `${guild.memberCount}`, inline: true },
                { name: '・Boosts :', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: '・Created At :', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>` }
            )
            .setColor('Gold');
        message.reply({ embeds: [embed] });
    }
};