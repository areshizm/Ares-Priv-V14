const { PermissionsBitField: { Flags } } = require('discord.js');

module.exports = {
    name: 'unmute',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares, embed) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.timeOutAuth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const member = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!member)
            return message.reply({ content: 'Bir kullanıcı belirtmelisin.' });

        if (member.id === message.author.id)
            return message.reply({ content: 'Bu sensin.' });

        if (member.isCommunicationDisabled() && member.communicationDisabledUntilTimestamp > Date.now()) {
            member.timeout(null)
            message.reply({ content: `${member} adlı üyenin susturması kaldırıldı.` })
        } else {
            message.reply({ content: `${member} adlı üye timeout yememiş.` })
        }
    }
}