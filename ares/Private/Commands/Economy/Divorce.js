const { bold } = require('discord.js');
const UserModel = require('../../../Schema/User')

module.exports = {
    name: 'boşan',
    aliases: ['divorce'],
    category: 'Economy',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();


        if (document.marriage.active === false) {
            message.reply('Zaten biriyle evli değilsin.');
            return;
        }

        const userDocument = (await UserModel.findOne({ id: document.marriage.married }));
        if (global.system.ownerID.includes(userDocument.id)) {
            message.reply('Görünüşe göre evlendiğin kişi bot sahibi veya sunucu sahibi olduğu için boşanamazsın.');
            return;
        }

        document.marriage.active = false;
        document.marriage.married = '';
        document.marriage.date = '';
        document.marriage.ring = '';
        document.markModified('marriage');
        await document.save();

        if (userDocument) {
            userDocument.marriage.active = false
            userDocument.marriage.married = ''
            userDocument.marriage.date = ''
            userDocument.marriage.ring = ''
            userDocument.markModified('marriage')
            await userDocument.save()
        }

        message.reply({ content: `Başarıyla boşandınız!` })
    }
}