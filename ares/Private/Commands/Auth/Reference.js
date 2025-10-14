const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'key',
    aliases: ['kayıt', 'referans', 'kayit', 'k'],
    category: 'Auth',

    execute: async (client, message, args, ares, embed) => {
        if (!message.member.permissions.has(Flags.Administrator) && !ares.auth.some(x => message.member.roles.cache.has(x)))
            return message.reply({ content: 'Yetkin yok.' });

        const member = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
        if (!member)
            return message.reply({ content: 'Bir kullanıcı belirtmelisin.' });

        const user = message.guild.members.cache.get(member.id);
        if (!user)
            return message.reply({ content: 'Kullanıcı bulunamadı.' });
        if (user.id === message.author.id)
            return message.reply({ content: 'Kendini kayıt edemezsin.' });
        if (message.member.roles.highest.id === member?.roles?.highest?.id)
            return message.reply({ content: 'Kendi rolündeki kişiyi kayıt edemezsin.' });
        if (member?.roles?.highest?.rawPosition >= message.member?.roles?.highest?.rawPosition)
            return message.reply({ content: 'Yetkili olduğun kişiyi kayıt edemezsin.' });
        if (message.guild?.members.me?.roles.highest.id === member?.roles?.highest?.id)
            return message.reply({ content: 'Botun rolündeki kişiyi kayıt edemezsin..' });

        if (ares.genderSystem) {

            if (user.roles.cache.has(ares.manRole) || user.roles.cache.has(ares.womanRole))
                return message.reply({ content: 'Bu kullanıcı zaten kayıtlı.' });

            const row = new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: 'man',
                        label: 'Erkek',
                        style: ButtonStyle.Secondary,
                    }),
                    new ButtonBuilder({
                        custom_id: 'woman',
                        label: 'Kadın',
                        style: ButtonStyle.Secondary,
                    }),
                ],
            });

            const question = await message.reply({
                content: 'Cinsiyetini belirmek için tıkla.',
                components: [row],
            });

            const filter = (i) => i.user.id === message.author.id;
            const collector = question.createMessageComponentCollector({ filter });

            collector.on('collect', async (i) => {
                if (i.customId === 'man') {
                    user.roles.add(ares.manRole).catch(() => null);
                    if (user.roles.cache.has(ares.unregisteredRole)) user.roles.remove(ares.unregisteredRole).catch(() => null);

                    question.edit({ content: `${user} kullanıcısı ${message.author} tarafından erkek olarak kayıt edildi.`, components: [] });
                    collector.stop();
                }


                if (i.customId === 'woman') {
                    user.roles.add(ares.womanRole).catch(() => null);
                    if (user.roles.cache.has(ares.unregisteredRole)) user.roles.remove(ares.unregisteredRole).catch(() => null);

                    question.edit({ content: `${user} kullanıcısı ${message.author} tarafından kadın olarak kayıt edildi.`, components: [] });  
                    collector.stop();
                }
            });
        } else {
            if (user.roles.cache.has(ares.registeredRole))
                return message.reply({ content: 'Bu kullanıcı zaten kayıtlı.' });

            user.roles.add(ares.registeredRole).catch(() => null);
            if (user.roles.cache.has(ares.unregisteredRole)) user.roles.remove(ares.unregisteredRole).catch(() => null);

            message.reply({ content: `${user} kullanıcısı ${message.author} tarafından kayıt edildi.` });
        }
    }
}