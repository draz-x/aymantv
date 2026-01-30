const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    async execute(client, message, args) {
        const user = message.mentions.users.first() || message.author;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('Gold');

        message.reply({ embeds: [embed] });
    }
};