const { ChannelType, PermissionsBitField } = require('discord.js');

const tempVoices = new Map();

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState, client) {
        const guild = newState.guild;

        const triggerChannels = {
            duo: '1465817756879425839',
            trio: '1465816389125148672',
            squad: '1465816430611271953'
        };
        const categoryId = '1465815960090050661';

        const customNames = {
            duo: '🔒・Duo',
            trio: '🔒・Trio',
            squad: '🔒・Squad'
        };

        if (newState.channelId && Object.values(triggerChannels).includes(newState.channelId)) {
            const triggerName = Object.keys(triggerChannels).find(
                key => triggerChannels[key] === newState.channelId
            );

            let userLimit = 0;
            if (triggerName === 'duo') userLimit = 2;
            if (triggerName === 'trio') userLimit = 3;
            if (triggerName === 'squad') userLimit = 4;

            let baseName = customNames[triggerName] || triggerName;
            let roomNumber = 1;

            while (guild.channels.cache.some(ch => ch.name === `${baseName} #${roomNumber}` && ch.parentId === categoryId)) {
                roomNumber++;
            }

            const tempName = `${baseName} #${roomNumber}`;

            const tempVoice = await guild.channels.create({
                name: tempName,
                type: ChannelType.GuildVoice,
                parent: categoryId,
                userLimit: userLimit,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: newState.member.id,
                        allow: [
                            PermissionsBitField.Flags.Connect
                        ]
                    }
                ]
            });

            await newState.setChannel(tempVoice).catch(console.log);

            tempVoices.set(tempVoice.id, newState.member.id);

            console.log(`✅ Created temp voice "${tempName}" for ${newState.member.user.tag}`);
        }

        if (oldState.channelId) {
            const oldChannel = oldState.channel;

            if (
                oldChannel &&
                tempVoices.has(oldChannel.id) && 
                oldChannel.members.size === 0
            ) {
                oldChannel.delete().catch(console.log);
                tempVoices.delete(oldChannel.id);
                console.log(`❌ Deleted empty temp voice: ${oldChannel.name}`);
            }
        }
    }
}