const { PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'snipe',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares) => {
        const snipe = ares.snipeData || [];
        if (snipe.length === 0) return message.reply({ content: 'Hiç mesaj silinmemiş.' });

        const embed = new EmbedBuilder({
            author: { name: message.member.displayName, icon_url: message.author.displayAvatarURL() },
            footer: { text: 'ares was here ❤️' },
            description: [
                `Yazan Kişi: <@${snipe[0].author}>`,
                `Silinme Tarihi: ${new Date(snipe[0].deleted).toLocaleString()}`,
                `Mesaj İçeriği: **${snipe[0].content ? (snipe[0].content.length > 200 ? snipe[0].content.slice(0, 200) + '...' : snipe[0].content) : 'Resim bulunuyor.'}**`,
            ].join('\n'),
        });

        const anotherEmbed = Array.from(snipe[0].attachments?.values() || []).map((img) => {
            return new EmbedBuilder({
                image: { url: img },
            });
        });

        message.channel.send({ embeds: [embed, ...anotherEmbed] });
    }
}