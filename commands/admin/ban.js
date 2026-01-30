const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ You do not have permission to ban members.");
            return message.reply({ embeds: [embed] });
        }

        const target = message.mentions.members.first();
        if (!target) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ Please mention a member to ban.");
            return message.reply({ embeds: [embed] });
        }

        if (!target.bannable) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ I cannot ban this member.");
            return message.reply({ embeds: [embed] });
        }

        const reason = args.slice(1).join(" ") || "No reason provided";
        await target.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor('#700000')
            .setTitle('User Banned :')
            .setDescription(`・**Member:** ${target.user.tag}\n・**Reason:** ${reason}\n・**Admin:** ${message.author}`);
        
        message.reply({ embeds: [embed] });
    }
};