const { PermissionsBitField: { Flags }, parseEmoji } = require('discord.js');

module.exports = {
    name: 'emoji',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.auth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        if (args.length === 0)
            return message.reply({ content: 'Geçerli bir emoji belirtlemlisiniz.' })


        if (args.length >= 5)
            return message.reply({ content: 'En fazla 5 emoji ekleyebilirsiniz.' })


        const emojiString = args.join(' ');
        const emojiList = emojiString.split('<');

        const results = await Promise.all(
            emojiList.slice(1).map(async (emojiPart, i) => {
                const isAnimated = emojiPart.includes('a:');
                emojiPart = emojiPart
                    .trim()
                    .replace(/^a:/, '')
                    .replace(/^:/, '')
                    .replace(/>$/, '');
                const parseCustomEmoji = parseEmoji(
                    `<${isAnimated ? 'a:' : ''}${emojiPart}`
                );

                if (!parseCustomEmoji.id) { 
                    return `Emoji bulunamadı.`;
                }

                const emojiLink = `https://cdn.discordapp.com/emojis/${parseCustomEmoji.id}.${isAnimated ? 'gif' : 'png'}`;

                try {
                    const createdEmoji = await message.guild.emojis.create({
                        attachment: emojiLink,
                        name: parseCustomEmoji.name,
                    });

                    return `${createdEmoji} emojisi sunucuya eklendi.`;
                } catch (error) {
                    return `Emoji eklenirken bir hata oluştu.`;
                }
            })
        );

        if (results.length === 0) return message.reply({ content: 'Geçerli bir emoji belirtmelisin.' });
        message.reply({ content: results.join('\n') });

    }
}