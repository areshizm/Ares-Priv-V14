const { PermissionsBitField: { Flags } } = require('discord.js');

module.exports = {
    name: 'ban',
    aliases: ['yasakla'],
    category: 'Auth',

    execute: async (client, message, args, ares, embed) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.banAuth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const member = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
        if (!member)
            return message.reply({ content: 'Bir kullanıcı belirtmelisin.' });

        const user = message.guild.members.cache.get(member.id);
        if (!user) 
            return message.reply({ content: 'Kullanıcı bulunamadı.' });
        if (user.id === message.author.id)
            return message.reply({ content: 'Kendini banlayamazsın.' });
        if (message?.member?.roles?.highest.id === member?.roles?.highest.id)
            return message.reply({ content: 'Kendi rolündeki kişiyi banlayamazsın.' });
        if (member?.roles?.highest?.rawPosition >= message?.member?.roles?.highest?.rawPosition) 
            return message.reply({ content: 'Yetkili olduğun kişiyi banlayamazsın.' });
        if (message.guild?.members.me?.roles.highest.id === member?.roles?.highest.id)
            return message.reply({ content: 'Botun rolündeki kişiyi banlayamazsın.' });

        user.ban({ reason: `Banlayan: ${message.author.username}` });

        const logChannel = message.guild.channels.cache.find(x => x.name === 'ban-log');
        if (logChannel) {
            logChannel.send({ embeds: [embed.setDescription(`${user} kullanıcısı ${message.author} tarafından banlandı.`)] });
        }

        message.reply({ content: `${user} kullanıcısı başarıyla banlandı.` });
    }
}