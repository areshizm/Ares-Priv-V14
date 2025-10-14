const { Events } = require('discord.js');

client.on(Events.GuildMemberRemove, async (member) => {

    const channel = member.guild.channels.cache.find(r => r.name === 'giriş-çıkış-log');
    if (channel) channel.send({ content: `${member} (${member.id}) sunucudan ayrıldı.` })
})