const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);


        client.user.setPresence({
            activities: [{ 
                name: 'https://www.kick.com/aymanTV', 
                type: ActivityType.Playing 
            }],
            status: 'idle', 
        });
    }
};