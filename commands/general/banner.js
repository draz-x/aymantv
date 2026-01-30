const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    async execute(client, message, args) {
        const user = message.mentions.users.first() || message.author;
        
        const fullUser = await client.users.fetch(user.id, { force: true });
        
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Banner`)
            .setColor('Gold');

        if (fullUser.bannerURL()) {
            embed.setImage(fullUser.bannerURL({ size: 1024, dynamic: true }));
        } else {
            embed.setDescription("This user doesn't have a banner.");
        }

        message.reply({ embeds: [embed] });
    }
};