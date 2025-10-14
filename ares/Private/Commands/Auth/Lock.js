const { PermissionsBitField: { Flags } } = require('discord.js');

module.exports = {
    name: 'kilit',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args, ares) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.auth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const role = message.guild.roles.everyone;
        const channelPermissions = message.channel.permissionOverwrites.cache.get(role.id) || { allow: new Set(), deny: new Set() };
        const hasSendMessagesPermission = !channelPermissions.allow.has(Flags.SendMessages) || channelPermissions.deny.has(Flags.SendMessages);
        message.channel.permissionOverwrites.edit(role.id, { SendMessages: hasSendMessagesPermission });
        message.channel.send({ content: `Başarıyla kanal kilidi ${hasSendMessagesPermission ? 'açıldı' : 'kapatıldı'}.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
    }
}