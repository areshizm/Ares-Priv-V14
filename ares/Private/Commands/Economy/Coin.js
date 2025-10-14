const { bold } = require('discord.js');
const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'coin',
    aliases: ['param', 'bankam', 'para','coin'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();
        message.reply({ content: `${message.author} bankanda ${bold(global.functions.formatNumber(document?.inventory?.cash || 0) + '$')} bulunmaktadır.` })
    }
}