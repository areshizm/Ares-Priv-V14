const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'parakaldır',
    aliases: ['parasil', 'parakaldir'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            message.reply(`Kullanıcı bulunamadı!`);
            return;
        }

        if (member.user.bot) {
            message.reply('Bot kullanıcı.');
            return;
        }

        if (isNaN(args[1])) {
            message.reply('Lütfen geçerli bir miktar giriniz.');
            return;
        }

        if (args[1] <= 0) {
            message.reply('Belirttiğiniz miktar geçersizdir.');
            return;
        }

        const document = (await UserModel.findOne({ id: member.id })) || new UserModel({ id: member.id }).save();
        document.inventory.cash -= Number(args[1])
        document.markModified('inventory')
        await document.save()

        message.reply({ content: `Başarıyla ${member} kullanıcısının bankasından ${global.functions.formatNumber(args[1])}$ kaldırdınız.` })
    }
}