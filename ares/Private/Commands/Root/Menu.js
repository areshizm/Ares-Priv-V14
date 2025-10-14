const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'menu',
    aliases: ['menü'],
    category: 'Root',

    execute: async (client, message, args) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('gri')
                .setLabel('Gri')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564394309947495'),
            new ButtonBuilder()
                .setCustomId('siyah')
                .setLabel('Siyah')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564387649388554'),
            new ButtonBuilder()
                .setCustomId('beyaz')
                .setLabel('Beyaz')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564357810978897'),
            new ButtonBuilder()
                .setCustomId('kırmızı')
                .setLabel('Kırmızı')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564350320083075'),
            new ButtonBuilder()
                .setCustomId('mavi')
                .setLabel('Mavi')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564417672351775'),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('sarı')
                .setLabel('Sarı')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564355625746606'),
            new ButtonBuilder()
                .setCustomId('yeşil')
                .setLabel('Yeşil')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564391344701532'),
            new ButtonBuilder()
                .setCustomId('mor')
                .setLabel('Mor')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564359216337051'),
            new ButtonBuilder()
                .setCustomId('turuncu')
                .setLabel('Turuncu')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564396176412823'),
            new ButtonBuilder()
                .setCustomId('pembe')
                .setLabel('Pembe')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1217564354548072508'),
        )
          const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('etkinlik')
                .setLabel('Etkinlik')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎉'), 
            new ButtonBuilder()
                .setCustomId('cekilis')
                .setLabel('Çekiliş')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎁'), 
        );
        message.channel.send({
            content: '> **Aşağıdaki butonlardan istediğiniz renk rolünü seçebilir veya etkinlik/çekilişe katılabilirsiniz.**\n',
            components: [row, row2,row3],
        })
    }
}