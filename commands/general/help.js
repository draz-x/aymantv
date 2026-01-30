const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available bot commands'),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 }); // Ephemeral

        // 🔧 MANUAL CONFIGURATION (EDIT HERE)
        const categories = [
            {
                name: 'Admin',
                emoji: '🛠️',
                commands: [
                    { name: '+ban', description: 'Ban a member from the server' },
                    { name: '+clear', description: 'Clear messages from chat' },
                    { name: '/create-event', description: 'Create server event' },
                    { name: '+kick', description: 'Kick a member from the server' },
                    { name: '+self-roles', description: 'Send self roles panel' },
                ]
            },
            {
                name: 'Clans',
                emoji: '🏰',
                commands: [
                    { name: '+create-clan', description: 'Create a new clan (admins only)' },
                    { name: '+delete-clan', description: 'Delete a clan (admins only)' },
                    { name: '+add', description: 'Add member to your clan (leaders & co leaders)' },
                    { name: '+remouve', description: 'Remouve member from your clan (leaders & co leaders)' },
                    { name: '+add-leader', description: 'Add co leader to your clan (leaders only)' },
                    { name: '+my-clan', description: 'See your clan informations' },
                    { name: '+clans', description: 'See all server clans' },
                ]
            },
            {
                name: 'General',
                emoji: '📜',
                commands: [
                    { name: '+avatar', description: 'Get member avatar' },
                    { name: '+banner', description: 'Get member banner' },
                    { name: '/help', description: 'Show all bot commands' },
                    { name: '+ping', description: 'See bot latency' },
                    { name: '+server', description: 'Show server informations' },
                    { name: '+user', description: 'Get user informations' },
                ]
            }
        ];
        // 🔧 END CONFIGURATION

        const fields = categories
            .filter(cat => cat.commands.length)
            .map(cat => ({
                name: `${cat.emoji}・${cat.name} Commands`,
                value: cat.commands
                    .map(cmd => `・**${cmd.name}** — ${cmd.description}`)
                    .join('\n'),
                inline: false
            }));

        const helpEmbed = new EmbedBuilder()
            .setTitle('🤖・Bot Commands')
            .setDescription('Here is a list of all available commands, grouped by category!')
            .addFields(fields)
            .setColor('Gold')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [helpEmbed] });
    }
};