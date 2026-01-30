const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (client) => {
    const username = client.config.kickUsername.toLowerCase();
    const discordChannelId = client.config.kickNotifyChannelId;
    const storageFile = './lastKickStatus.json';
    const checkInterval = client.config.kickCheckInterval || 120000; // default 2 min

    // Load last state from file
    let lastState = { wasLive: false };
    if (fs.existsSync(storageFile)) {
        try {
            lastState = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        } catch (err) {
            console.warn("⚠️ Failed to read lastKickStatus.json, using default state.");
        }
    }

    setInterval(async () => {
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 8000); // 8s timeout

            const res = await globalThis.fetch(`https://kick.com/api/v2/channels/${username}`, {
                signal: controller.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0 (DiscordBot)",
                    "Accept": "application/json"
                }
            });

            if (!res.ok) return;

            const data = await res.json();
            const isLive = !!data?.livestream; // check if livestream exists

            // Only send notification if just went live
            if (isLive && !lastState.wasLive) {
                const stream = data.livestream;
                const channel = client.channels.cache.get(discordChannelId);

                if (channel && data.user) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: `${data.user.username} is LIVE on Kick`,
                            iconURL: data.user.profile_pic
                        })
                        .setTitle(stream?.session_title || "Live Stream")
                        .setURL(`https://kick.com/${username}`)
                        .setColor(0x53FC18)
                        .addFields(
                            { name: "・Category :", value: stream?.categories?.[0]?.name || "Unknown", inline: true },
                            { name: "・Viewers :", value: `${stream?.viewer_count || 0}`, inline: true }
                        )
                        .setImage(stream?.thumbnail?.url || data.user.profile_pic)
                        .setTimestamp();

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("Watch Stream")
                            .setURL(`https://kick.com/${username}`)
                            .setStyle(ButtonStyle.Link)
                    );

                    await channel.send({
                        content: `🟢 @everyone **${data.user.username} is LIVE now!**`,
                        embeds: [embed],
                        components: [row]
                    });
                }
            }

            // Save state
            lastState.wasLive = isLive;
            fs.writeFileSync(storageFile, JSON.stringify(lastState));
        } catch (err) {
            if (err.name !== 'AbortError') console.error("Kick fetch error:", err);
        }
    }, checkInterval);

    console.log("💚 Kick Live Notifier is active.");
};