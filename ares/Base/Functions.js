const { inlineCode, ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../Schema/User');
const OneDay = 1000 * 60 * 60 * 24;

module.exports = class Functions {
    
    static date(date) {
        return new Date(date).toLocaleString('tr-TR', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    static async addStat({ type, member, channel, message, value }) {
        const now = new Date();
        let document = await User.findOne({ id: member.id })
        if (!document) {
            document = new User({ id: member.id })
            await document.save();
        }

        const diff = now.valueOf() - document.lastDayTime;
        if (diff >= OneDay) {
            document.day += Math.floor(diff / OneDay);
            document.lastDayTime = now.setHours(0, 0, 0, 0);
            document.markModified('day lastDayTime');
        }

        if (type === 'message') {
            if (!document.messages) document.messages = {};
            if (!document.messages[document.day]) document.messages[document.day] = { total: 0 };

            const dayData = document.messages[document.day];
            dayData.total += 1;
            dayData[message.channel.id] = (dayData[message.channel.id] || 0) + 1;
            document.markModified('messages');

            await document.save();
        }

        if (type === 'voice') {
            if (!document.voices) document.voices = {};
            if (!document.voices[document.day]) document.voices[document.day] = { total: 0 };

            const dayData = document.voices[document.day];
            dayData.total += value;
            dayData[channel.id] = (dayData[channel.id] || 0) + value;
            document.markModified('voices');

            await document.save();
        }

        if (type === 'stream') {
            if (!document.streams) document.streams = {};
            if (!document.streams[document.day]) document.streams[document.day] = { total: 0 };

            const dayData = document.streams[document.day];
            dayData.total += value;
            dayData[channel.id] = (dayData[channel.id] || 0) + value;
            document.markModified('streams');

            await document.save();
        }

        if (type === 'camera') {
            if (!document.cameras) document.cameras = {};
            if (!document.cameras[document.day]) document.cameras[document.day] = { total: 0 };

            const dayData = document.cameras[document.day];
            dayData.total += value;
            dayData[channel.id] = (dayData[channel.id] || 0) + value;
            document.markModified('cameras');

            await document.save();
        }
    }

    static getChannels(guild, document, days, day) {
        const channelStats = {};
        let total = 0;
        Object.keys(days)
            .filter((d) => day > document.day - Number(d))
            .forEach((d) =>
                Object.keys(days[d]).forEach((channelId) => {
                    const channel = guild.channels.cache.get(channelId);
                    if (!channel) return;

                    if (!channelStats[channelId]) channelStats[channelId] = 0;
                    channelStats[channelId] += days[d][channelId];
                    total += days[d][channelId];
                }),
            );

        return {
            channels: Object.keys(channelStats)
                .sort((a, b) => channelStats[b] - channelStats[a])
                .map((c) => ({ id: c, value: channelStats[c] }))
                .slice(0, 10),
            total,
        };
    };

    static getCategory(guild, document, days, day) {
        const channelStats = {};
        let total = 0;
        Object.keys(days)
            .filter((d) => day > document.day - Number(d))
            .forEach((d) =>
                Object.keys(days[d]).forEach((channelId) => {
                    const channel = guild.channels.cache.get(channelId);
                    if (!channel || !channel.parentId) return;

                    if (!channelStats[channel.parentId]) channelStats[channel.parentId] = 0;
                    channelStats[channel.parentId] += days[d][channel.id];
                    total += days[d][channel.id];
                }),
            );

        return {
            categories: Object.keys(channelStats)
                .sort((a, b) => channelStats[b] - channelStats[a])
                .map((c) => ({ id: c, value: channelStats[c] }))
                .slice(0, 10),
            total,
        };
    };

    static formatDurations(ms) {
        const seconds = Math.floor(ms / 1000) % 60; 
        const minutes = Math.floor(ms / (1000 * 60)) % 60; 
        const hours = Math.floor(ms / (1000 * 60 * 60)); 

        const parts = [];
        if (hours > 0) parts.push(`${hours} saat`);
        if (minutes > 0) parts.push(`${minutes} dakika`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} saniye`);

        return parts.join(' ');
    }

    static async getPageData(currentPage, guildMembers, totalQuery) {
        return await User.aggregate([
            {
                $project: {
                    id: '$id',
                    total: totalQuery
                }
            },
            {
                $match: {
                    id: { $in: guildMembers },
                    total: { $gt: 0 }
                }
            },
            {
                $sort: {
                    total: -1
                }
            },
            {
                $skip: (currentPage - 1) * 10
            },
            {
                $limit: 10
            }
        ]);
    }

    static async pageEmbed(client, guild, type, datas, page) {
        const specials = {
            1: '🏆',
            2: '🥈',
            3: '🥉'
        };

        const topTitle = {
            messages: 'Mesaj Sıralaması',
            voices: 'Ses Sıralaması',
            streams: 'Yayın Sıralaması',
            cameras: 'Kamera Sıralaması',
        };

        return new EmbedBuilder({
            footer: { text: 'ares was here ❤️' },
            title: topTitle[type],
            thumbnail: {
                url: guild.iconURL({ size: 2048 }) || ''
            },

            description: [
                ...datas.map((data, index) => {
                    const user = guild.members.cache.get(data.id);
                    if (!user) return;
                    const valueString = type === 'messages' ? `${data.total || 0} mesaj` : global.functions.formatDurations(data.total);
                    return `${inlineCode(` ${specials[this.shortNumber(index + (page - 1) * 10 + 1)] || `${index + (page - 1) * 10 + 1}.`} `)} ${user || user.displayName} - ${valueString}`;
                })
            ].join('\n'),
        })
    }

    static shortNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'Mr';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else {
            return num.toString();
        }
    };

    static async pagination(client, message, type, id) {
        const guildMembers = message.guild.members.cache.filter((member) => !member.user.bot).map((member) => member.id);

        const totalQuery = {
                        $reduce: {
                            input: { $objectToArray: `$${type}` },
                            initialValue: 0,
                            in: {
                                $add: ['$$value', { $toDouble: '$$this.v.total' }]
                            }
                        }
                    };

        const validRecordsCount = await User.aggregate([
            {
                $project: {
                    id: '$id',
                    total: totalQuery
                }
            },
            {
                $match: {
                    id: { $in: guildMembers },
                    total: { $gt: 0 }
                }
            },
            {
                $count: 'total'
            }
        ]).then(result => result[0]?.total || 0);

        const totalData = Math.ceil(validRecordsCount / 10);
        let page = 1;

        const initialData = await this.getPageData(page, guildMembers, totalQuery);
        await message.edit({
            embeds: [await this.pageEmbed(client, message.guild, type, initialData, page)],
            components: [this.getButton(page, totalData || 1)]
        });

        const filter = (i) => i.user.id === id;
        const collector = await message.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 2,
            max: 20,
            componentType: ComponentType.Button
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'first') page = 1;
            else if (i.customId === 'previous') page = Math.max(1, page - 1);
            else if (i.customId === 'next') page = Math.min(totalData, page + 1);
            else if (i.customId === 'last') page = totalData;

            const newData = await this.getPageData(page, guildMembers, totalQuery);
            await message.edit({
                embeds: [await this.pageEmbed(client, message.guild, type, newData, page)],
                components: [this.getButton(page, totalData || 1)]
            });
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') message.edit({
                embeds: [await this.pageEmbed(client, message.guild, type, initialData, page)],
            });
        });
    }

    static getButton(page, totalData) {
        return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setEmoji('1070037431690211359')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('1061272577332498442')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('count')
                .setLabel(`${page}/${totalData}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('1061272499670745229')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(totalData === page),
            new ButtonBuilder()
                .setCustomId('last')
                .setEmoji('1070037622820458617')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalData),
        );
    }

    static formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}