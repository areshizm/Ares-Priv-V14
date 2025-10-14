const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kayıtpanel',
    aliases: [],
    category: 'Root',

    execute: async (client, message, args) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const allowedRole = '1424416081430446150'; // Kayıtsız rolü
        const manRole = '1424404935117901864';     // Erkek rolü
        const womanRole = '1424404934203539479';   // Kadın rolü
        const unregisteredRole = '1424416081430446150'; // Kayıtsız rolü

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('register_man')
                .setLabel('Erkek')
                .setEmoji('<:erkek:1382385048103420117>')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('register_woman')
                .setLabel('Kadın')
                .setEmoji('<:kadin:1382385054675767327>')
                .setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setColor('#030303')
            .setAuthor({ name: `${message.guild.name} • Kayıt Paneli`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTitle('<:MMM:1391230623762481302> Kayıt Olmak İçin Seçimini Yap!')
            .setDescription(
                `> <a:ares_face:1389398607291088977> **Hoş geldin!**  
> <:Duyuru:1423886713448824954> Aşağıdaki butonlardan cinsiyetini seçerek kayıt olabilirsin.  

**<a:ayarcik:1389402627321892874> Seçenekler:**  
> <:aresfavmember:1423886643982630943> **Erkek** — Erkek rolünü alır, kayıtsız rolün kalkar.  
> <:aresfavmember:1423886643982630943> **Kadın** — Kadın rolünü alır, kayıtsız rolün kalkar.  

*Bu panel sadece <@&${allowedRole}> rolündeki Kayıtsız Kullanıcılar tarafından kullanılabilir.*`
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Kayıt Sistemi • Ares Was Here' })
            .setTimestamp();

        const panelMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = panelMessage.createMessageComponentCollector({ time: 1000 * 60 * 60 * 24 }); // 24 saat aktif

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            if (!interaction.member.roles.cache.has(allowedRole)) {
                return interaction.reply({ content: 'Bu paneli kullanman için kayıtsız olmalısın.', ephemeral: true });
            }

            if (interaction.customId === 'register_man') {
                await interaction.member.roles.add(manRole).catch(() => null);
                if (interaction.member.roles.cache.has(unregisteredRole))
                    await interaction.member.roles.remove(unregisteredRole).catch(() => null);

                return interaction.reply({ content: '<a:check:1424152511299981515> Erkek rolün verildi, artık kayıtsız değilsin.', ephemeral: true });
            }

            if (interaction.customId === 'register_woman') {
                await interaction.member.roles.add(womanRole).catch(() => null);
                if (interaction.member.roles.cache.has(unregisteredRole))
                    await interaction.member.roles.remove(unregisteredRole).catch(() => null);

                return interaction.reply({ content: '<a:check:1424152511299981515> Kadın rolün verildi, artık kayıtsız değilsin.', ephemeral: true });
            }
        });
    }
};
