const { bold } = require('discord.js');
const InviteRegExp = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;

module.exports = {
    name: 'afk',
    aliases: ['av'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const reason = args.join(' ') || `Şu anda meşgulüm, yakın bir zamanda geri döneceğim!`;
        if (InviteRegExp.test(reason) || message.mentions.everyone) return message.delete()

        client.afks.set(message.author.id, {
            reason: reason.length > 0 ? reason.slice(0, 2000) : null,
            timestamp: Date.now(),
            mentions: []
        })

        message.channel.send(`${message.author}, seni etiketleyenlere ${bold('AFK')} olduğunu bildireceğim.`).then((msg) => setTimeout(() => msg.delete(), 5000));
    }
}