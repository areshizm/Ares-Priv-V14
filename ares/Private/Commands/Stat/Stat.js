const { PermissionsBitField: { Flags }, bold, inlineCode } = require('discord.js');
const User = require('../../../Schema/User');

module.exports = {
    name: 'stat',
    aliases: ['verilerim', 'me', 'stats'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.botCommandChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(`Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            message.reply('Botların verisi bulunamaz!');
            return;
        }

        const document = await stats(client, member, args[0] ? Number(args[0]) : undefined);
        if (!document) {
            message.reply('Veri bulunmuyor.');
            return;
        }

        const argIndex = member.id !== message.author.id ? 1 : 0;
        const wantedDay = args[argIndex] ? Number(args[argIndex]) : document.day;
        if (!wantedDay || 0 >= wantedDay) {
            message.reply('Geçerli gün sayısı belirt!');
            return;
        };

        embed.setDescription(`${member} adlı kullanıcının ${bold(`${wantedDay} günlük`)} veri bilgileri;`)
            .setFooter({ text: `${wantedDay > document.day ? `${document.day.toString()} günlük veri bulundu.` : 'ares was here ❤️'}` })
            .addFields(
                {
                    name: `Toplam Ses Kanal Sıralaması (${global.functions.formatDurations(document.voice)})`,
                    value: (await Promise.all(document.channels.voice.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${findEmoji(client, 'point')} ${channel}: ${inlineCode(global.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Yayın Kanal Sıralaması (${global.functions.formatDurations(document.stream)})`,
                    value: (await Promise.all(document.channels.stream.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${findEmoji(client, 'point')} ${channel}: ${inlineCode(global.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Kamera Kanal Sıralaması (${global.functions.formatDurations(document.camera)})`,
                    value: (await Promise.all(document.channels.camera.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${findEmoji(client, 'point')} ${channel}: ${inlineCode(global.functions.formatDurations(data.value))}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },

                {
                    name: `Toplam Mesaj Kanal Sıralaması (${document.message} Mesaj)`,
                    value: (await Promise.all(document.channels.message.channels
                        .filter((d) => message.guild?.channels.cache.has(d.id))
                        .map(async (data) => {
                            const channel = message.guild?.channels.cache.get(data.id) || '#silinmiş-kanal';
                            if (!channel) return;

                            return `${findEmoji(client, 'point')} ${channel}: ${inlineCode(data.value + ' mesaj')}`;
                        })
                    )).slice(0, 10).join('\n') || 'Veri bulunamadı.',
                    inline: false,
                },
            );

        message.channel.send({
            embeds: [embed]
        });
    }
}

async function stats(client, member, requested) {
    const document = await User.findOne({ id: member.id });

    if (!document) return null;

    const voiceDays = document.voices || {};
    const messageDays = document.messages || {};
    const streamDays = document.streams || {};
    const cameraDays = document.cameras || {};

    return {
        day: document.day,
        voice: Object.keys(voiceDays).filter((d) => requested ? requested : document.day >= document.day - Number(d)).reduce((totalCount, currentDay) => totalCount + voiceDays[currentDay].total, 0),
        message: Object.keys(messageDays).filter((d) => requested ? requested : document.day >= document.day - Number(d)).reduce((totalCount, currentDay) => totalCount + messageDays[currentDay].total, 0),
        stream: Object.keys(streamDays).filter((d) => requested ? requested : document.day >= document.day - Number(d)).reduce((totalCount, currentDay) => totalCount + streamDays[currentDay].total, 0),
        camera: Object.keys(cameraDays).filter((d) => requested ? requested : document.day >= document.day - Number(d)).reduce((totalCount, currentDay) => totalCount + cameraDays[currentDay].total, 0),
        channels: {
            message: global.functions.getChannels(member.guild, document, messageDays, requested ? requested : document.day),
            voice: global.functions.getChannels(member.guild, document, voiceDays, requested ? requested : document.day),
            stream: global.functions.getChannels(member.guild, document, streamDays, requested ? requested : document.day),
            camera: global.functions.getChannels(member.guild, document, cameraDays, requested ? requested : document.day),
        },

        category: {
            message: global.functions.getCategory(member.guild, document, messageDays, requested ? requested : document.day),
            voice: global.functions.getCategory(member.guild, document, voiceDays, requested ? requested : document.day),
            stream: global.functions.getCategory(member.guild, document, streamDays, requested ? requested : document.day),
            camera: global.functions.getCategory(member.guild, document, cameraDays, requested ? requested : document.day),
        }
    }
}

function findEmoji(client, name) {
    return client.emojis.cache.find(emoji => emoji.name === name);
}