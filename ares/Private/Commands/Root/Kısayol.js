const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder,StringSelectMenuBuilder } = require('discord.js');
const Settings = require('../../../Schema/Settings');

module.exports = {
    name: 'kısayol',
    aliases: [],
    category: 'Root',

    execute: async (client, message, args) => {
        if (!global.system.ownerID.includes(message.author.id)) return;


        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder()
                    .setCustomId('kısayolI')
                    .setLabel(`I`)
                    .setStyle(ButtonStyle.Secondary),
                     new ButtonBuilder()
                    .setCustomId('kısayolII')
                    .setLabel(`II`)
                    .setStyle(ButtonStyle.Secondary),
                     new ButtonBuilder()
                    .setCustomId('kısayolIII')
                    .setLabel(`III`)
                    .setStyle(ButtonStyle.Secondary)
            ]
        })
       const commandsRow = new ActionRowBuilder()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId('command_category')
                    .setPlaceholder(`${client.commands.size} Komut`)
                    .addOptions([
                        { label: 'Kullanıcı Komutları', value: 'General' },
                        { label: 'Eğlence Komutları', value: 'Economy' },
                        { label: 'Üst Komutları', value: 'Auth' },
                        { label: 'Owner Komutları', value: 'Root' }
                    ])
            ]);
        let embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setDescription(`### Merhaba \`${message.guild.name}\` kullanıcı paneline hoş geldin!\n
**Sunucu içerinde yapmak istediğin işlemleri aşağıda ki butonlar ile yapabilirsin.**\n
- **I**: \`Hesabınızın açılış tarihini öğrenin.\`
- **II**: \`Sunucuya giriş tarihinizi öğrenin.\`  
- **III**: \`Üstünüzde bulunan rollerin listesini alın.\`

**Komutlar**
Aşağıda ki menüden komut kategorilerini seçerek o kategoriye ait komutları görebilirsin.\n`)

        message.channel.send({  embeds: [embed], components: [row,commandsRow] });
    }
}