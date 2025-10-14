const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'top',
    aliases: ['sıralama'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.botCommandChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const titlesAndKeys = {
            messages: { text: 'Mesaj Sıralaması', emoji: '📝' },
            voices: { text: 'Ses Sıralaması', emoji: '🔊' },
            cameras: { text: 'Kamera Sıralaması', emoji: '📷' },
            streams: { text: 'Yayın Sıralaması', emoji: '📺' },
        }

        const row = new ActionRowBuilder({
            components: [
                new StringSelectMenuBuilder({
                    customId: 'top',
                    placeholder: 'Lütfen bir kategori seçin.',
                    options: Object.keys(titlesAndKeys).map((key) => ({
                        label: titlesAndKeys[key].text,
                        value: key,
                        emoji: titlesAndKeys[key].emoji
                    }))
                })
            ]
        })

        const question = await message.channel.send({
            components: [row],
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = question.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 2,
        });

        collector.on('collect', async (i) => {
            collector.stop();
            i.deferUpdate();
            global.functions.pagination(client, question, i.values[0], message.author.id);
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') question.delete();
        });
    }
}