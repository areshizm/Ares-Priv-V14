const { PermissionsBitField: { Flags } } = require('discord.js');

module.exports = {
    name: 'unban',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares, embed) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.banAuth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const member = await client.users.fetch(args[0]);
        if (args[0] === message.author.id)
            return message.reply({ content: 'Bu sensin.' });

        const bans = await message.guild.bans.fetch();
        if (bans.size === 0)
            return message.reply({ content: 'Bu sunucuda banlanmış bir kullanıcı yok.' });

        const bannedMember = bans.find(x => x.user.id == args[0]);
        if (!bannedMember) 
            return message.reply({ content: 'Bu kullanıcı banlanmamış.' });

        message.guild.members.unban(args[0]);
        message.reply({ content: `${member} kullanıcısının banı kaldırıldı.` });
    }
}