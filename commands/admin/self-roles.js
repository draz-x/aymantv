const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'self-roles',
    async execute(client, message, args) {

        if (!message.member.roles.cache.has(client.config.adminRoleId)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Permission Denied')
                .setDescription('You do not have permission to use this command. Only administrators can run this.');
            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎭 Role Selection Panel")
            .setDescription(
                "Use The Buttons Below To Customize Your Experience.\n" +
                "・**Games Roles** : Get Your Favorite Games Roles.\n" +
                "・**Notifications** : Choose What Updates You Get Pinned For.\n" +
                "・You Can Change Roles Anytime."
            )
            .setColor("Gold")
            .setImage("https://cdn.discordapp.com/attachments/1465221001620230280/1466072906365931671/file_00000000c4c8722fa033779cf179af35.png?ex=697b6a4b&is=697a18cb&hm=b4ed5a8d5f51b1e43cbc06e85bbc7b99b08e4d9232d85b3c0c33061c4c69f06e&")
            .setFooter({ text: "Powered by AymanTV, All rights © reserved.", iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_games')
                .setLabel('Games Roles')
                .setEmoji('🎮')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('btn_notifs')
                .setLabel('Notification Roles')
                .setEmoji('📢')
                .setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
    }
};