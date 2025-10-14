const { Events } = require('discord.js');
const Settings = require('../../../Schema/Settings');

client.on(Events.GuildMemberAdd, async (member) => {

    const channel = member.guild.channels.cache.find(r => r.name === 'giriş-çıkış-log');
    if (channel) channel.send({ content: `${member} (${member.id}) sunucuya giriş yaptı.` })

    const document = await Settings.findOne({ id: member.guild.id });
    if (!document) return;

    if (document.autoRole) {
        member.roles.add(document.registeredRole);
    } else {
        member.roles.add(document.unregisteredRole);
    }
})