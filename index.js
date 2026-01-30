const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.config = config;

// load handlers
require('./handlers/antiCrash')(client);
require('./handlers/youtube')(client);
require('./handlers/kick')(client);
require('./handlers/tempVoicePrefix')(client);
client.on('interactionCreate', i => require('./tempvoice/buttons')(i));

// command handler
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        
        if (Array.isArray(command)) {
            command.forEach(cmd => {
                const name = cmd.data ? cmd.data.name : cmd.name;
                client.commands.set(name, cmd);
            });
        } else {
            const name = command.data ? command.data.name : command.name;
            client.commands.set(name, command);
        }
    }
}

// log commands
console.log(`✅ Loaded ${client.commands.size} total commands.`);

// event handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (!event.name || !event.execute) {
        console.log(`❌ Invalid event file: ${file}`);
        continue;
    }

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`✅ Loaded event: ${event.name}`);
}

// connect to mongo db
mongoose.connect(config.mongoURI)
    .then(() => console.log('🍃 Connected to MongoDB Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

client.login(config.token);