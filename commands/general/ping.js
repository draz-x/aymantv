const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    execute(client, message) {
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setDescription(`🏓 **Pong!** \`${client.ws.ping}ms\``);
        message.reply({ embeds: [embed] });
    }
};