const { PermissionsBitField: { Flags }, ActionRowBuilder, RoleSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Settings = require('../../../Schema/Settings')

module.exports = {
    name: 'özelkomut',
    aliases: ['ozelkomut'],
    category: 'Root',

    execute: async (client, message, args, ares) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        if (!['ekle', 'çıkar', 'liste'].some(x => args[0] == x)) return message.reply({ content: `Lütfen geçerli bir işlem belirtin. \`ekle\`, \`çıkar\`, \`liste\`` })

            if (args[0] == 'ekle') {
                const data = ares ? ares.specialCmds : [];
                const msg = await message.channel.send({
                    content: `Eklemek istediğin komutun adını yazman yeterlidir. (İşlem 15 saniye sonra iptal edilecektir.)`
                })
    
                const filter = i => i.author.id == message.member.id
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });
    
                const commandName = collected.first()?.content.trim();
    
                if (data.find(cmd => cmd.permName === commandName)) {
                    return message.reply({ content: `Bu komut zaten eklenmiş.` });
                }
    
                if (commandName === 'iptal' || commandName === 'i') {
                    return initialMessage.delete();
                }
    
                if (commandName.includes(' ')) {
                    return message.channel.send({ content: `Komut ismi boşluk içeremez.` });
                }
    
                if (commandName.length > 20) {
                    return message.channel.send({ content: `Komut ismi 20 karakterden uzun olamaz.` });
                }
    
                const push = { permName: commandName };
                await collected.first()?.delete();
                const authRoleMessage = await msg.edit({
                    content: 'Komutu kullanma izni verilcek rolleri aşağıda ki menüden seçiniz.',
                    components: [new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId('permRoleSelectMenu')
                            .setMaxValues(5)
                    )]
                })
    
                const collector = msg.createMessageComponentCollector({
                    filter: i => i.user.id === message.author.id, time: 45000
                });
    
                collector.on('collect', async i => {
                    if (i.customId === 'permRoleSelectMenu') {
                        push.permRoles = i.values;
                        await i.deferUpdate();
    
                        const roleMessage = await message.channel.send({
                            content: `Verilecek rolü seçin.`,
                            components: [new ActionRowBuilder().addComponents(
                                new RoleSelectMenuBuilder()
                                    .setCustomId('permRolesSelectMenu')
                                    .setMaxValues(5)
                            )]
                        });
    
                        const roleCollector = roleMessage.createMessageComponentCollector({
                            filter: i => i.user.id === message.author.id, time: 35000
                        });
    
                        roleCollector.on('collect', async i => {
                            if (i.customId === 'permRolesSelectMenu') {
                                push.permRoles2 = i.values;

                                await Settings.updateOne(
                                    { id: message.guild.id }, 
                                    { $push: { specialCmds: push } },
                                    { upsert: true }
                                );
    
                                await i.deferUpdate();
                                await roleMessage.delete();
                                await authRoleMessage.delete();
    
                                return message.channel.send({
                                    embeds: [
                                        new EmbedBuilder({
                                            description: [
                                                `Özel komut başarıyla eklendi.`,
                                                `**Komut Adı:** ${push.permName}`,
                                                `**Y. Rolleri:** ${push.permRoles.map(x => `<@&${x}>`).join(', ')}`,
                                                `**Roller:** ${push.permRoles2.map(x => `<@&${x}>`).join(', ')}`
                                            ].join('\n')
                                        })
                                    ]
                                });
                            }
                        });
                    }
                });
            } else if (args[0] == 'çıkar') {
                const data = ares ? ares.specialCmds : [];
                const msg = await message.channel.send({
                    content: `Çıkarmak istediğin komutun adını yazman yeterlidir. (İşlem 15 saniye sonra iptal edilecektir.)`
                })
    
                const filter = i => i.author.id == message.member.id
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });
    
                const commandName = collected.first()?.content.trim();
    
                if (!data.find(cmd => cmd.permName === commandName)) {
                    return message.reply({ content: `Bu komut bulunamadı.` });
                }
    
                if (commandName === 'iptal' || commandName === 'i') {
                    return initialMessage.delete();
                }
    
                await Settings.updateOne(
                    { id: message.guild.id }, 
                    { $pull: { specialCmds: { permName: commandName } } },
                    { upsert: true }
                );

                return msg.edit({
                    embeds: [
                        new EmbedBuilder({
                            description: `Özel komut başarıyla çıkarıldı.`
                        })
                    ]
                });
    
            } else if (args[0] == 'liste') {
                const data = ares ? ares.specialCmds : [];
                if (!data.length) return message.reply({ content: `Hiç özel komut eklenmemiş.` });
    
                let page = 1;
                const totalData = Math.ceil(data.length / 15);
    
                const embed = new EmbedBuilder({
                    description: `Toplamda ${data.length} özel komut bulunmakta.\n\n${data.slice(0, 15).map((cmd) => `**Komut Adı:** ${cmd.permName}\n**Y. Rolleri:** ${cmd.permRoles.map(x => `<@&${x}>`).join(', ')}\n**Roller:** ${cmd.permRoles2.map(x => `<@&${x}>`).join(', ')}\n${data.length > 1 ? `------------------` : ''}`).join('\n')}`
                })
    
                const msg = await message.channel.send({
                    embeds: [embed],
                    components: totalData > 1 ? [getButton(page, totalData)] : []
                });
    
                const collector = msg.createMessageComponentCollector({ time: 60000 });
    
                collector.on('collect', async i => {
                    if (i.user.id !== message.author.id) return;
    
                    await i.deferUpdate();
                    if (i.customId === 'first') page = 1;
                    if (i.customId === 'previous') page -= 1;
                    if (i.customId === 'next') page += 1;
                    if (i.customId === 'last') page = totalData;
    
                    embed.setDescription(data.slice((page - 1) * 10, page * 10).join('\n'))
                    await msg.edit({ embeds: [embed], components: [getButton(page, totalData)] });
                });
            }   
    }
}

function getButton(page, total) {
    return new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('first')
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId('previous')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId('count')
            .setLabel(`${page}/${total}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(total === page),
        new ButtonBuilder()
            .setCustomId('last')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === total),
    );
}