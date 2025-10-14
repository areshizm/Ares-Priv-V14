const { PermissionsBitField } = require('discord.js');
const Settings = require('../../../../Schema/Settings')
const linkCooldowns = new Map();
const reklamCooldowns = new Map();

module.exports = async function Link(client, message) {
    const document = await Settings.findOne({ id: message.guild.id })
    if (!document) return;

    if (!document?.linkGuard) return;

    const reklamRegex = /discord\.gg\/\w+|discordapp\.com\/invite\/\w+/gi;
    if (reklamRegex.test(message.content) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        if (!reklamCooldowns.has(message.author.id)) {
            reklamCooldowns.set(message.author.id, 1);
        } else {
            reklamCooldowns.set(message.author.id, reklamCooldowns.get(message.author.id) + 1);
        }

        if (reklamCooldowns.get(message.author.id) >= 5) {
            message.member.timeout(300000);
            message.delete();
            reklamCooldowns.delete(message.author.id);
        }

        if (reklamCooldowns.get(message.author.id) <= 5) {
            message.delete();
            message.channel.send(`${message.author}, reklam yapmak yasaktır!`).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        }
        return;
    }

    const linkRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
    if (linkRegex.test(message.content) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        if (!linkCooldowns.has(message.author.id)) {
            linkCooldowns.set(message.author.id, 1);
        } else {
            linkCooldowns.set(message.author.id, linkCooldowns.get(message.author.id) + 1);
        }

        if (linkCooldowns.get(message.author.id) >= 5) {
            message.member.timeout(300000);
            message.delete();
            linkCooldowns.delete(message.author.id);
        }

        if (linkCooldowns.get(message.author.id) <= 5) {
            message.delete();
            message.channel.send(`${message.author}, linkler yasaktır!`).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        }
        return;
    }
}