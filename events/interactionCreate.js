const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {

        // ==========================
        // BUTTONS SELF ROLES
        // ==========================
        if (interaction.isButton()) {

            if (!['btn_games', 'btn_notifs'].includes(interaction.customId)) return;

            // games roles
            if (interaction.customId === 'btn_games') {
                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('🎮・Games Roles')
                    .setDescription('Select your game roles from the menu below.');

                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_games')
                        .setPlaceholder('Choose your game roles...')
                        .addOptions([
                            { label: 'Free Fire', value: '1465202011187318937', emoji: '🔫' }
                        ])
                );

                return interaction.reply({
                    embeds: [embed],
                    components: [menu],
                    flags: MessageFlags.Ephemeral
                });
            }

            // notifications roles
            if (interaction.customId === 'btn_notifs') {
                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('📢・Notification Roles')
                    .setDescription('Select your notification roles from the menu below.');

                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_notifs')
                        .setPlaceholder('Choose notification roles...')
                        .addOptions([
                            { label: 'Server Updates', value: '1465211474472337559', emoji: '🆙' }
                        ])
                );

                return interaction.reply({
                    embeds: [embed],
                    components: [menu],
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        // ==========================
        // SELECT MENU SELF ROLES
        // ==========================
        if (interaction.isStringSelectMenu()) {

            if (!['select_games', 'select_notifs'].includes(interaction.customId)) return;

            const roleId = interaction.values[0];
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription('❌ Role not found.')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            let embed;

            if (interaction.member.roles.cache.has(roleId)) {
                await interaction.member.roles.remove(roleId);
                embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`❌ Removed **${role.name}** role.`);
            } else {
                await interaction.member.roles.add(roleId);
                embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`✅ Added **${role.name}** role.`);
            }

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }

        // ==========================
        // SLASH COMMANDS HANDLER
        // ==========================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.log(`❌ Command ${interaction.commandName} not found in client.commands`);
                return;
            }

            try {
                console.log(`🚀 Executing Slash Command: ${interaction.commandName}`);
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({ content: 'There was an error!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error!', ephemeral: true });
                }
            }
            return;
        }
    }
};
