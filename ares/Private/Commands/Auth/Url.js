const { PermissionsBitField: { Flags }, bold } = require('discord.js');

module.exports = {
    name: 'url',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.auth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        if (!message.guild.vanityURLCode)
            return message.reply({ content: 'Özel URL bulunamadı.' });

        const link = await message.guild.fetchVanityData();
        message.reply({ content: `https://discord.gg/${message.guild.vanityURLCode} ${bold(`(${link.uses} kez kullanıldı.)`)}` })
    }
}