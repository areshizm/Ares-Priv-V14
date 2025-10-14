const { Events, codeBlock, EmbedBuilder, AuditLogEvent } = require('discord.js');
const Settings = require('../../../Schema/Settings');

client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || !message.author || message.author.bot || !message.guild || message.embeds.length > 0 || message.content == null) return;

    await Settings.updateOne({ id: message.guild.id }, {
        $set: {
            snipeData: {
                id: message.id,
                author: message.author,
                content: message.cleanContent,
                attachments: message.attachments.map(attachment => attachment.url),
                created: message.createdTimestamp,
                deleted: Date.now(),
            }
        }, 
    }, { upsert: true });

    const channel = message.guild.channels.cache.find((c) => c.name === 'mesaj-log');
    if (!channel) return;

    const fetchedLogs = await message.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete });
    const entry = fetchedLogs.entries.first();

    const embed = new EmbedBuilder({
        author: { name: message.author.username, icon_url: message.author.displayAvatarURL({ extension: 'png', size: 4096 }) },
        description: [
            message.cleanContent.length ? codeBlock('fix', message.cleanContent) : undefined,
            codeBlock('yaml', [
                '# Bilgilendirme',
                `→ Kanal: ${message.channel.name}`,
                `→ Mesaj ID: ${message.id}`,
                `→ Gönderen: ${message.author.username} (${message.author.id})`,
                `→ Yetkili: ${entry?.executor?.username || 'Bulunamadı'}`,
                `→ Gönderilme Tarihi: ${date(message.createdTimestamp)}`,
            ].join('\n')),
        ].filter(Boolean).join('\n'),
    });

    const msg = await channel.send({ embeds: [embed] });
    const chunks = chunkArray(message.attachments.map(attachment => attachment.url), 4);

    for (const chunk of chunks) {
        const embeds = [new EmbedBuilder().setTitle('Mesaj Resimleri').setURL('https://ares.live')];

        for (const img of chunk) {
            embeds.push(new EmbedBuilder({
                url: 'https://ares.live',
                image: {
                    url: img,
                },
            }));
        }

        await msg.reply({ embeds: embeds });
    };
})

function date(date) {
    return new Date(date).toLocaleString('tr-TR', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    });
};

function chunkArray(array, chunkSize) {
    const temp = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        temp.push(array.slice(i, i + chunkSize));
    }
    return temp;
};