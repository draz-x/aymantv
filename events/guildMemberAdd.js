const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'guildMemberAdd',

    async execute(member, client) {

        const channel = member.guild.channels.cache.get(client.config.welcomeChannelId);
        if (!channel) return;

        const accountAgeDays = Math.floor(
            (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)
        );

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`👋 Welcome to ${member.guild.name}!`)
            .setDescription(
                `Hello ${member}\n\n` +
                `**🔹・User Tag :** ${member.user.tag}\n` +
                `**🔹・Account Age :** (${accountAgeDays} days ago)\n` +
                `**🔹・Join Position :** #${member.guild.memberCount}\n` +
                `${member.premiumSince ? `**💎 Boosting Since :** ${moment(member.premiumSince).format('MMMM Do YYYY')}\n` : ''}` +
                `\nPlease check out the rules and enjoy your stay!`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(member.guild.bannerURL({ dynamic: true, size: 1024 }) || null)
            .setTimestamp()
            .setFooter({
                text: `AymanTV Manager`,
                iconURL: member.guild.iconURL({ dynamic: true, size: 128 })
            });

        channel.send({ embeds: [embed] });
    }
};