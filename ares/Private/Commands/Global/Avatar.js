const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['av'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.botCommandChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const user = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null) || message.author;
        if (!user) return message.channel.send({ content: 'Bir kullanıcı belirtmelisin.' });

        const member = await message.guild.members.fetch(user.id).catch(() => null);

        const genelAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
        const sunucuAvatar = member?.avatar ? member.displayAvatarURL({ dynamic: true, size: 4096 }) : null;

        // Embed: Genel Avatar
        const genelEmbed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: genelAvatar })
            .setColor('Blurple')
            .setTitle('Genel Avatar')
            .setImage(genelAvatar);

        // Buton (Sunucu Avatarı varsa ekle)
        const row = new ActionRowBuilder();
        if (sunucuAvatar) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('server_avatar')
                    .setLabel('Sunucu Avatarı')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        const msg = await message.channel.send({
            embeds: [genelEmbed],
            components: sunucuAvatar ? [row] : []
        });

        if (!sunucuAvatar) return;

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30_000
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'server_avatar') {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: 'Bu buton sadece komutu kullanan kişiye özeldir.', ephemeral: true });
                }

                const sunucuEmbed = new EmbedBuilder()
                    .setAuthor({ name: user.username, iconURL: sunucuAvatar })
                    .setColor('Green')
                    .setTitle('Sunucuya Özel Avatar')
                    .setImage(sunucuAvatar);

                await interaction.update({ embeds: [sunucuEmbed] });
            }
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};
