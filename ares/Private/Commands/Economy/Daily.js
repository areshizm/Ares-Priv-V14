const { bold } = require('discord.js');
const UserModel = require('../../../Schema/User')

const cooldown = new Map();

module.exports = {
    name: 'daily',
    aliases: ['günlük', 'günlükpara', 'dailycoin'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        if (cooldown.has(message.author.id)) {
            const time = cooldown.get(message.author.id);
            return message.reply({ content: `Bu komutu tekrar kullanabilmek için **${time}** saniye beklemelisin.` });
        }

        let daily = Math.random()
        daily = daily * (5000 - 100)
        daily = Math.floor(daily) + 100

        const user = await UserModel.findOne({ id: message.author.id });
        await UserModel.updateOne({ id: message.author.id }, { $inc: { 'inventory.cash': daily } }, { upsert: true });

        const newBalance = user ? user.inventory.cash + daily : daily;
        message.reply({ content: `Günlük ödülünüz **${bold(global.functions.formatNumber(daily) + '$')}** olarak belirlendi. Bankanda şu an **${bold(global.functions.formatNumber(newBalance) + '$')}** bulunmaktadır.` });

        const cooldownTime = Date.now() + (86400 * 1000);
        cooldown.set(message.author.id, cooldownTime);
    }
}