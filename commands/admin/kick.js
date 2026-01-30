const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ You do not have permission to kick members.");
            return message.reply({ embeds: [embed] });
        }

        const target = message.mentions.members.first();
        if (!target) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ Please mention a member to kick.");
            return message.reply({ embeds: [embed] });
        }

        if (!target.kickable) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ I cannot kick this member.");
            return message.reply({ embeds: [embed] });
        }

        const reason = args.slice(1).join(" ") || "No reason provided";
        await target.kick(reason);

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('User Kicked :')
            .setDescription(`・**Member:** ${target.user.tag}\n・**Reason:** ${reason}\n・**Admin:** ${message.author}`);
        
        message.reply({ embeds: [embed] });
    }
};