const { PermissionsBitField: { Flags }, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, inlineCode } = require('discord.js');

module.exports = {
    name: 'çek',
    aliases: ['pull'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.botCommandChannel);
        if (message.channel.name !== channel?.name)
            return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        if (!message.member.voice.channel)
            return message.reply({ content: 'Bir ses kanalında olmalısınız!' });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.reply({ content: 'Kullanıcı bulunamadı!' });
        if (member.id === message.author.id)
            return message.reply({ content: 'Bu zaten sensin!' });
        if (!member.voice.channel)
            return message.reply({ content: 'Kullanıcı bir ses kanalında değil!' });
        if (member.voice.channel.id === message.member.voice.channel.id)
            return message.reply({ content: 'Kullanıcı zaten aynı kanalda!' });

        if (message.member.permissions.has(Flags.MoveMembers)) {
            member.voice.setChannel(message.member.voice.channel.id);
            message.reply({ content: `Başarıyla ${member} kullanıcısı sizin bulunduğunuz kanala taşındı.` });
        } else {
            const row = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'accept',
                        label: 'Onayla',
                        style: ButtonStyle.Success,
                        emoji: { id: '1054856853814788216' },
                    }),
                    new ButtonBuilder({
                        custom_id: 'cancel',
                        label: 'Reddet',
                        style: ButtonStyle.Danger,
                        emoji: { id: '1057679211021746186' },
                    }),
                ],
            });

            const question = await message.reply({
                content: member.toString(),
                embeds: [
                    new EmbedBuilder({
                        description: `${message.member} sizi bulunduğu kanala çekmek istiyor. Kabul ediyor musunuz?`,
                    })
                ],
                components: [row],
            });

            const filter = (i) => i.user.id === member.id;
            const collector = question.createMessageComponentCollector({
                filter,
                time: 1000 * 60 * 5,
                componentType: ComponentType.Button,
            });

            collector.on('collect', async i => {
                if (i.customId === 'accept') {
                    member.voice.setChannel(message.member.voice.channel.id);
                    question.edit({
                        embeds: [
                            embed.setDescription(
                                `${member}, ${message.member} kullanıcısının kanalına başarıyla taşındı.`,
                            ),
                        ],
                        components: [],
                    });
                } else {
                    question.edit({
                        embeds: [
                            embed.setDescription(
                                `${member}, ${message.member} kullanıcısının isteğini reddetti.`,
                            ),
                        ],
                        components: [],
                    });
                }
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') question.edit({
                    embeds: null,
                    content: `${inlineCode(`5 dakika boyunca kullanıcının yanıt vermemesi nedeniyle işlem iptal edildi`)}`,
                })
            })
        }
    }
};
