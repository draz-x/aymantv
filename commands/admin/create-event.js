const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-event')
        .setDescription('Create a server voice event')
        .addChannelOption(option => 
            option.setName('voice')
                .setDescription('Voice channel to host event')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
        .addStringOption(option => option.setName('topic').setDescription('Event topic').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('YYYY-MM-DD').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('HH:MM (24h)').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Details about the event').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const voiceChannel = interaction.options.getChannel('voice');
        const topic = interaction.options.getString('topic');
        const dateStr = interaction.options.getString('date');
        const timeStr = interaction.options.getString('time');
        const description = interaction.options.getString('description');

        const startTime = new Date(`${dateStr}T${timeStr}:00`);
        if (isNaN(startTime.getTime())) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Invalid Input')
                .setDescription('The date or time format is invalid. Please use **YYYY-MM-DD** for date and **HH:MM (24h)** for time.')
                .setColor('Red')
                .setTimestamp();

            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            const event = await interaction.guild.scheduledEvents.create({
                name: topic,
                scheduledStartTime: startTime,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.Voice,
                description: description,
                channel: voiceChannel
            });

            const announceChan = interaction.guild.channels.cache.get(interaction.client.config.eventAnnouncementChannelId);
            if (announceChan) {
                const announceEmbed = new EmbedBuilder()
                    .setTitle(`📅・NEW EVENT : ${topic}`)
                    .setDescription(description)
                    .addFields(
                        { name: '🔊・Channel :', value: `${voiceChannel}`, inline: true },
                        { name: '⏰・Time :', value: `<t:${Math.floor(startTime.getTime() / 1000)}:F>`, inline: true },
                        { name: '🎟️・Join Event :', value: `[Click to join](${event.url})`, inline: false }
                    )
                    .setColor('Gold')
                    .setTimestamp();

                await announceChan.send({ content: "@everyone", embeds: [announceEmbed] });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('✅・Event Created')
                .setDescription(`Your event **${topic}** has been successfully created.`)
                .addFields(
                    { name: '・Channel :', value: `${voiceChannel}`, inline: true },
                    { name: '・Time :', value: `<t:${Math.floor(startTime.getTime() / 1000)}:F>`, inline: true },
                    { name: '・Join Event :', value: `[Click to join](${event.url})`, inline: false }
                )
                .setColor('Green')
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (err) {
            console.error(err);
            const failEmbed = new EmbedBuilder()
                .setTitle('❌ Failed to Create Event')
                .setDescription('Make sure I have **Manage Events** permission and try again.')
                .setColor('Red')
                .setTimestamp();

            await interaction.editReply({ embeds: [failEmbed] });
        }
    }
};