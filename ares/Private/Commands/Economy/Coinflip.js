const { bold } = require('discord.js');
const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'coinflip',
    aliases: ['cf'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();

        const amount = Number(args[0])
        if (args[0] == 'all') {
            if (document.inventory.cash >= 10000) amount = 10000
            if (document.inventory.cash < 10000) amount = document.inventory.cash
            if (document.inventory.cash <= 0) amount = 10
        }

        if (isNaN(amount)) {
            message.reply('Lütfen geçerli bir miktar giriniz!');
            return;
        }

        if (amount <= 0) {
            message.reply('Belirttiğiniz miktar geçersizdir!');
            return;
        }

        if (amount > 10000) {
            message.reply('Maksimum miktar 10.000$ olabilir.');
            return;
        }

        if (amount < 10) {
            message.reply('Minumum miktar 10$ olabilir.');
            return;
        }

        if (amount > document.inventory.cash) {
            message.reply('Yeterli paranız bulunmamaktadır.');
            return;
        }

        document.inventory.cash -= Number(amount)
        document.markModified('inventory')

        let winAmount = Number(amount * 2)
        winAmount = winAmount.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')

        const msg = await message.channel.send({ content: `${bold(winAmount + '$')} için bahis döndürülüyor!...` })
        setTimeout(async () => {
            let rnd = Math.floor(Math.random() * 2),
                result
            if (rnd == 1) {
                result = 'kazandın'
                document.inventory.cash += Number(amount * 2)
                document.markModified('inventory')
            } else result = 'kaybettin'
            msg.edit({ content: `**${winAmount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}** için bahis döndürülme durdu ve ${result}!` })
            document.save()
        }, 4000)
    }
}