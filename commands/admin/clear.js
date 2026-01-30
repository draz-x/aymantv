const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'clear',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ You do not have permission to manage messages.");
            return message.reply({ embeds: [embed] });
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("❌ Please provide a number between 1 and 100.");
            return message.reply({ embeds: [embed] });
        }

        await message.channel.bulkDelete(amount, true);

        const embed = new EmbedBuilder()
            .setColor('#53FC18')
            .setDescription(`✅ Successfully deleted **${amount}** messages.`);
        
        message.channel.send({ embeds: [embed] }).then(m => {
            setTimeout(() => m.delete(), 5000);
        });
    }
};