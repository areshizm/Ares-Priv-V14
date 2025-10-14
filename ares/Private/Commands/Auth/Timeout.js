const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, inlineCode, bold } = require('discord.js');
const ms = require('ms');
const timeouts = {
    '1': 1000 * 60 * 5,
    '2': 1000 * 60 * 10,
    '3': 1000 * 60 * 60,
    '4': 1000 * 60 * 60 * 24,
    '5': 1000 * 60 * 60 * 24 * 7
};

module.exports = {
    name: 'mute',
    aliases: ['timeout'],
    category: 'Auth',

    execute: async (client, message, args, ares, embed) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.timeOutAuth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const member = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.reply({ content: 'Bir kullanıcı belirtmelisin.' });

        if (member.id === message.author.id)
            return message.reply({ content: 'Kendine timeout atamazsın.' });
        if (message.member.roles?.highest.id === member.roles?.highest.id)
            return message.reply({ content: 'Kendi rolündeki kişiye timeout atamazsın.' });
        if (member.roles?.highest?.rawPosition >= message.member.roles?.highest?.rawPosition)
            return message.reply({ content: 'Yetkili olduğun kişiye timeout atamazsın.' });
        if (message.guild?.members.me?.roles.highest.id === member?.roles?.highest.id)
            return message.reply({ content: 'Botun rolündeki kişiye timeout atamazsın.' });

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: '1',
                    label: '5 Dakika',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: '2',
                    label: '10 Dakika',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: '3',
                    label: '1 Saat',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: '4',
                    label: '1 Gün',
                    style: ButtonStyle.Primary,
                }),
                new ButtonBuilder({
                    custom_id: '5',
                    label: '1 Hafta',
                    style: ButtonStyle.Primary,
                }),
            ],
        });

        const question = await message.reply({
            embeds: [
                new EmbedBuilder({
                    description: `${member} adlı kullanıcıyı susturmak için süre seçin.`,
                })
            ],
            components: [row],
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = question.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 5,
            componentType: ComponentType.Button,
        });

        collector.on('collect', async i => {
            const duration = timeouts[i.customId];
            if (duration) {
                member.timeout(duration);
                question.edit({
                    embeds: [
                        embed.setDescription(
                            `${member} kullanıcısı başarıyla ${bold(ms(duration))} süresince susturuldu.`
                        ),
                    ],
                    components: [],
                });

                const logChannel = message.guild.channels.cache.find(x => x.name === 'mute-log');
                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            embed.setDescription(
                                `${member} kullanıcısı ${message.author} tarafından ${bold(ms(duration))} süresince susturuldu.`
                            ),
                        ],
                    });
                }
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                question.edit({
                    embeds: null,
                    content: `${inlineCode(`5 dakika boyunca kullanıcının yanıt vermemesi nedeniyle işlem iptal edildi.`)}`,
                })
            }
        })
    }
}