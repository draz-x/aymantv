const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
    const channelId = client.config.ytChannelId; 
    const discordChannelId = client.config.ytNotifyChannelId;
    const storageFile = './lastVideo.json';

    if (!channelId?.startsWith("UC")) {
        console.error("❌ Invalid YouTube Channel ID");
        return;
    }

    console.log(`✅ YouTube Notifier linked to: ${channelId}`);

    setInterval(async () => {
        try {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            const feed = await parser.parseURL(rssUrl);

            if (!feed?.items?.length) return;

            const latest = feed.items[0];
            const videoId = latest.id.split(':')[2];

            let lastData = { id: "" };
            if (fs.existsSync(storageFile)) {
                lastData = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
            }

            if (lastData.id === videoId) return;

            fs.writeFileSync(storageFile, JSON.stringify({ id: videoId }));

            const channel = client.channels.cache.get(discordChannelId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(latest.title)
                .setURL(latest.link)
                .setColor("#FF0000")
                .setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
                .setTimestamp();

            channel.send({
                content: `🚨 @everyone **New YouTube Video Posted!**\n${latest.link}`,
                embeds: [embed]
            });

        } catch {
            console.log("YouTube check skipped");
        }
    }, client.config.ytCheckInterval || 300000);
};