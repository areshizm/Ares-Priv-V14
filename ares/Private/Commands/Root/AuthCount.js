module.exports = {
    name: 'ysay',
    aliases: ['yetkilisay'],
    category: 'Root',

    execute: async (client, message, args, ares) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const familyRole = message.guild?.roles.cache.get(ares.familyRole)
        if (!familyRole) return message.reply('Family rolü bulunamadı.');

        const members = await message.guild?.members.fetch();
        if (!members) return;

        const familyMembers = members.filter(m => m.roles.cache.has(familyRole.id));
        const notVoiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(familyRole.id) && !m.voice.channelId);

        await message.channel.send({
            content: [
                `Rolde ${familyMembers.size} kişi bulunmakta.`,
                `Ses Kanalında Olmayanlar: ${notVoiceMembers.size} kişi`,
                `Sese geçin oçlar :rage:`
            ].join('\n')
        });

        if (notVoiceMembers.size > 0) {
            const notVoiceArray = notVoiceMembers.map(member => `<@${member.id}>`);
            const chunks = [];

            for (let i = 0; i < notVoiceArray.length; i += 50) {
                chunks.push(notVoiceArray.slice(i, i + 50).join(', '));
            }

            for (const chunk of chunks) {
                await message.channel.send({ content: chunk });
            }
        }
    }
}