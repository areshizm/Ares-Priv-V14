const { EmbedBuilder } = require('discord.js')
const Settings = require('../../../../Schema/Settings')

module.exports = async function Command(client, message, prefix) {
    if (message.author.id === '1218637955040809030') return;

    let document = await Settings.findOne({ id: message.guild.id })
    if (!document) {
        document = new Settings({ id: message.guild.id })
        await document.save()
    }

    const embed = new EmbedBuilder({
        author: {
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ extension: 'png', size: 4096 })
        }
    });

    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(1).trim().split(/ +/g);
    const commands = args.shift().toLowerCase();
    const cmd = client.commands.get(commands) || [...client.commands.values()].find((e) => e.aliases && e.aliases.includes(commands));
    if (cmd) {
        cmd.execute(client, message, args, document, embed);
    }
}