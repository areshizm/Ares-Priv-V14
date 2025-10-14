const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, bold } = require('discord.js');
const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'paragönder',
    aliases: ['paragonder', 'pg', 'para-gönder', 'para-gonder'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member) {
            message.reply(`Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            message.reply('Bot kullanıcı.');
            return;
        }

        if (member.id === message.author.id) {
            message.reply('Kendinize para gönderemezsiniz!');
            return;
        }

        const amount = Number(args[1])
        if (isNaN(amount)) {
            message.reply('Lütfen geçerli bir miktar giriniz!');
            return;
        }

        if (amount <= 0) {
            message.reply('Belirttiğiniz miktar geçersizdir!');
            return;
        }

        if (amount > document.inventory.cash) {
            message.reply('Yeterli paranız bulunmamaktadır.');
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    custom_id: 'accept',
                    label: 'Onayla',
                    style: ButtonStyle.Success,
                    emoji: '✅'
                }),
                new ButtonBuilder({
                    custom_id: 'cancel',
                    label: 'İptal',
                    style: ButtonStyle.Danger,
                    emoji: '❌'
                }),
            ],
        });

        const question = await message.reply({
            embeds: [
                new EmbedBuilder({
                    thumbnail: { url: member.displayAvatarURL({ dynamic: true }) },
                    timestamp: new Date(),
                    author: { name: `${message.author.username}, ${member.username} adlı kullanıcıya para göndermek üzeresin.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `Bu işlemi onaylamak için ✅ Onayla'ya tıklayın.`,
                        `Bu işlemi iptal etmek için ❌ İptal'e tıklayın.`,
                        '',
                        ` ${message.author} kullanıcısın ${member} adlı kullanıcıya göndereceği miktar:\n${codeBlock('fix', global.functions.formatNumber(amount) + '$')}`
                    ].join('\n')
                })
            ],
            components: [row]
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (i) => {
            i.deferUpdate();

            if (i.customId === 'accept') {
                const userDocument = (await UserModel.findOne({ id: member.id })) || new UserModel({ id: member.id }).save();

                userDocument.inventory.cash += Number(amount)
                userDocument.markModified('inventory')
                document.inventory.cash -= Number(amount)
                document.markModified('inventory')

                await userDocument.save();
                await document.save(); 

                question.edit({
                    embeds: [],
                    content: `${message.author.username}, ${member} kullanıcısının bankasına ${global.functions.formatNumber(bold(amount + '$'))} gönderdi.`,
                    components: []
                });
            } else {
                question.edit({
                    embeds: [],
                    content: `İşlem iptal edildi.`,
                    components: []
                });
            }
        });
    }
}