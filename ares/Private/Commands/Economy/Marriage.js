const { bold, EmbedBuilder } = require('discord.js');
const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'evlilik',
    aliases: ['kocam', 'karım', 'karim', 'sevgilim', 'manitam'],
    category: 'Economy',

    execute: async (client, message, args, ares) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();
        const marriage = document.marriage

        if (marriage.active === false) {
            message.reply({ content: 'Sen yalnızsın :smile:' });
            return;
        }

        const user = await client.users.fetch(marriage.married)
        const ring = marriage.ring
        const date = new Date(marriage.date).toLocaleDateString()

        let thumbnailURL;
        let description;

        if (ring === 1) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334384558110'
            description = 'Pırlanta'
        } else if (ring === 2) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334036693004'
            description = 'Baget'
        } else if (ring === 3) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334003138570'
            description = 'Tektaş'
        } else if (ring === 4) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335819272203.gif'
            description = 'Tria'
        } else if (ring === 5) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335915479040.gif'
            description = 'Beştaş'
        }

        const embed = new EmbedBuilder({
            author: { name: `${message.author.username}, ${user.username} ile evlisiniz!` },
            timestamp: new Date(),
            thumbnail: { url: thumbnailURL },
            footer: { text: description + ' Yüzük', iconURL: thumbnailURL },
            description: `${date} tarihinden beri evlisiniz! ${bold(description)} yüzüğünüzle mutluluğunuz daim olsun!`
        })

        message.reply({ embeds: [embed] })
    }
}