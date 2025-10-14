const { PermissionsBitField: { Flags }, bold } = require('discord.js');

module.exports = {
    name: 'sil',
    aliases: ['temizle'],
    category: 'Auth',

    execute: async (client, message, args, ares) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.auth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const amount = args[0];
        if (!amount || isNaN(amount)) return message.reply({ content: 'Bir sayı belirtmelisin.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (amount < 1 || amount > 100) return message.reply({ content: '1 ile 100 arasında bir sayı belirtmelisin.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        message.channel.bulkDelete(amount).catch(err => { });
        message.channel.send({ content: `Başarıyla ${bold(amount)} adet mesaj silindi.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
    }
}