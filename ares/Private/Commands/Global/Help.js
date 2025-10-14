const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, bold, inlineCode } = require('discord.js');
const { Colors } = require('discord.js');

module.exports = {
    name: 'yardım',
    aliases: ['help', 'yardim', 'komutlar', 'commands'],
    category: 'General',
    description: 'Sunucudaki komutlar hakkında bilgi verir.',
    usage: 'yardım [komut]',

    execute: async (client, message, args, ares) => {
        const botCommandChannel = ares.botCommandChannel;
        const channel = message.guild.channels.cache.get(botCommandChannel);

        if (channel && message.channel.id !== channel?.id) {
            return message.reply({
                content: `Bu komut sadece ${channel} kanalında kullanılabilir.`,
                ephemeral: true
            });
        }

        const commandName = args[0];
        if (commandName) {
            return showCommandInfo(client, message, commandName);
        }

        return showMainHelpMenu(client, message);
    }
};


async function showCommandInfo(client, message, commandName) {
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        return message.reply({
            content: `\`${commandName}\` adında bir komut bulunamadı. Komut listesini görmek için \`.yardım\` yazabilirsiniz.`,
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({
            name: `${client.user.username} | Komut Bilgisi`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle(`\`${command.name}\` Komutu`)
        .setDescription([
            `${await getEmoji(client, 'point')} ${bold('Komut')}: ${inlineCode(command.name)}`,
            `${await getEmoji(client, 'arrow')} Açıklama: ${inlineCode(command.description || 'Açıklama bulunmuyor.')}`,
            `${await getEmoji(client, 'arrow')} Kullanım: ${inlineCode(command.usage || command.name)}`,
            `${await getEmoji(client, 'arrow')} Alternatifler: ${command.aliases?.length ? command.aliases.map(a => inlineCode(a)).join(', ') : 'Alternatif yok'}`,
            `${await getEmoji(client, 'arrow')} Kategori: ${inlineCode(command.category)}`
        ].join('\n'))
        .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_main')
                .setLabel('Ana Menüye Dön')
                .setStyle(ButtonStyle.Secondary)
        );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if (i.customId === 'help_main') {
            await showMainHelpMenu(client, message, reply);
        }
    });

    collector.on('end', () => {
        reply.edit({ components: [createTimesUpRow()] }).catch(() => { });
    });
}

async function showMainHelpMenu(client, message, existingMessage = null) {
    const categoryCount = [...new Set(client.commands.map(cmd => cmd.category))].length;

    const embed = new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({
            name: message.guild.name,
            iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setDescription([
            `<:aresfavmember:1423886643982630943> Merhaba ${message.author}, benim komutlarımı görmek için aşağıdaki menüden bir kategori seçebilirsin.`,
            '',
            `<:Duyuru:1423886713448824954> Bilgilendirme;`,
            `<:point:1424152542807589007> Prefix: ${inlineCode('.')}`,
            `<:point:1424152542807589007> Toplam Komut: ${inlineCode(client.commands.size)}`,
            `<:point:1424152542807589007> Toplam Kategori: ${inlineCode(categoryCount)}`
        ].join('\n'))
        .setFooter({ text: `${message.author.tag} tarafından istendi`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder(`${client.commands.size} Komut`)
                .addOptions([
                    { label: 'Kullanıcı Komutları', value: 'General', },
                    { label: 'Eğlence Komutları', value: 'Economy', },
                    { label: 'Üst Komutları', value: 'Auth', },
                    { label: 'Owner Komutları', value: 'Root', }
                ])
        );

    const messageOptions = { embeds: [embed], components: [row] };

    if (existingMessage) {
        await existingMessage.edit(messageOptions);
        return existingMessage;
    } else {
        const reply = await message.reply(messageOptions);

        const filter = i => i.user.id === message.author.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'help_category') {
                const categoryName = i.values[0];
                await showCategoryCommands(client, message, categoryName, i, reply);
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                reply.edit({ components: [createTimesUpRow()] }).catch(() => { });
            }
        });

        return reply;
    }
}


async function showCategoryCommands(client, message, categoryName, interaction, msg) {
    const filteredCommands = client.commands.filter((x) => x.category === categoryName);

    if (filteredCommands.size === 0) {
        return interaction.reply({
            content: 'Bu kategoride komut bulunamadı!',
            ephemeral: true
        });
    }

    let page = 1;
    const totalPages = Math.ceil(filteredCommands.size / 10);

    const updateEmbed = async (currentPage) => {
        const commandsToShow = Array.from(filteredCommands.values())
            .slice((currentPage - 1) * 10, currentPage * 10);

        const commandDescriptions = [];

        for (const cmd of commandsToShow) {
            commandDescriptions.push(
                `${await getEmoji(client, 'point')} ${bold(cmd.name)}\n` +
                `- Açıklama: ${inlineCode(cmd.description || 'Belirtilmemiş')}\n` +
                `- Kullanım: ${inlineCode(cmd.usage || cmd.name)}\n` +
                `- Alternatifler: ${cmd.aliases && cmd.aliases.length > 0 ?
                    cmd.aliases.map(a => inlineCode(a)).join(', ') : 'Yok'}\n`
            );
        }

        return new EmbedBuilder()
            .setColor(getRandomColor())
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setAuthor({
                name: `${categoryName} Komutları`,
                iconURL: message.guild.iconURL({ dynamic: true })
            })
            .setDescription(commandDescriptions.join('\n'))
            .setFooter({
                text: `Sayfa: ${currentPage}/${totalPages} • ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
    };

    const categoryEmbed = await updateEmbed(page);
    const menuRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_main')
                .setLabel('Ana Menüye Dön')
                .setStyle(ButtonStyle.Secondary)
        );

    const components = [];
    if (totalPages > 1) {
        components.push(createPaginationRow(page, totalPages));
    }
    components.push(menuRow);

    await interaction.update({
        embeds: [categoryEmbed],
        components: components
    });

    const filter = (i) => i.user.id === message.author.id;
    const buttonCollector = msg.createMessageComponentCollector({
        filter,
        time: 60000
    });

    buttonCollector.on('collect', async (i) => {
        if (i.customId === 'help_main') {
            await showMainHelpMenu(client, message, msg);
            return;
        }

        await i.deferUpdate();

        if (i.customId === 'first') page = 1;
        if (i.customId === 'previous') page = Math.max(1, page - 1);
        if (i.customId === 'next') page = Math.min(totalPages, page + 1);
        if (i.customId === 'last') page = totalPages;

        const newEmbed = await updateEmbed(page);
        const newComponents = [];

        if (totalPages > 1) {
            newComponents.push(createPaginationRow(page, totalPages));
        }
        newComponents.push(menuRow);

        await i.editReply({
            embeds: [newEmbed],
            components: newComponents
        });
    });

    buttonCollector.on('end', (_, reason) => {
        if (reason === 'time') {
            msg.edit({ components: [createTimesUpRow()] }).catch(() => { });
        }
    });
}


function createPaginationRow(currentPage, totalPages) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setLabel('İlk')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏮️')
                .setDisabled(currentPage === 1),
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Önceki')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('◀️')
                .setDisabled(currentPage === 1),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Sonraki')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('▶️')
                .setDisabled(currentPage === totalPages),
            new ButtonBuilder()
                .setCustomId('last')
                .setLabel('Son')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏭️')
                .setDisabled(currentPage === totalPages)
        );
}

function createTimesUpRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('timeout')
                .setLabel('Süre doldu')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⏱️')
                .setDisabled(true)
        );
}

function getRandomColor() {
    const colors = Object.values(Colors);
    return colors[Math.floor(Math.random() * colors.length)];
}


function getEmojiId(client, name) {

    if (client.getEmoji) {
        try {
            const emoji = client.getEmoji(name);
            return emoji || null;
        } catch (error) {
            return null;
        }
    }
    return null;
}

async function getEmoji(client, name) {
    if (client.getEmoji) {
        try {
            return await client.getEmoji(name);
        } catch (error) {
            return name === 'arrow' ? '➡️' : name === 'point' ? '•' : '•';
        }
    }
    return name === 'arrow' ? '➡️' : name === 'point' ? '•' : '•';
}