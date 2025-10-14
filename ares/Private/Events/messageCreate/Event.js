const { Events } = require('discord.js');
const { Special, Link, Command, Afk, Stat, Mention } = require('./Functions');

client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot || !message.content) return;
    if (message.guild.id !== system.serverID) {
        await message.guild.leave()
    }

    const prefixes = [...system.Private.Prefix, `<@${client.user.id}>`, `<@!${client.user.id}>`]
    const prefix = prefixes.find((p) => message.content.startsWith(p))

    Special(client, message, prefix)
    Link(client, message)
    Command(client, message, prefix)
    Afk(client, message, prefix)
    Stat(client, message)
    Mention(message)
})