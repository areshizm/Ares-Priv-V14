const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Settings = require('../../../../Schema/Settings')

module.exports = async function Special(client, message, prefix) {
    const document = await Settings.findOne({ id: message.guild.id })
    if (!document) return;

    const data = document?.specialCmds || [];
    let cmd, args;

    if (prefix) {
        args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args[0].toLowerCase();
        cmd = data.find((cmd) => cmd.permName === command);
        args.shift();

        if (!cmd && [`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(prefix)) {
            cmd = data.find((cmd) => cmd.permName === command);
            args.shift();
        }

        if (!cmd) return;

           const hasRequiredRole = Array.isArray(cmd.permRoles)
            ? cmd.permRoles.some((id) => message.member.roles.cache.has(id) || message.member.id === id)
            : message.member.roles.cache.has(cmd.permRoles) || message.member.id === cmd.permRoles;

        const hasAdminPermissions = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            message.member.permissions.has(PermissionsBitField.Flags.ManageRoles);

        if (!hasRequiredRole && !hasAdminPermissions) {
            message.reply({ content: 'Bu komutu kullanmak için yetkiniz bulunmamaktadır.' });
            return;
        }
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) 
            return message.reply({ content: 'Geçerli bir üye belirtmelisiniz.' });



        const hasRole = cmd.permRoles2 ? cmd.permRoles2.some((role) => member.roles.cache.has(role)) : member.roles.cache.has(cmd.permRoles2);

        if (hasRole) {
            await member.roles.remove(cmd.permRoles2).catch(() => { });

            const embed = new EmbedBuilder({
                author: { name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) },
                description: `${member} kullanıcısından ${cmd.permRoles2.map((role) => `<@&${role}>`).join(', ')} ${cmd.permRoles2.length > 1 ? 'rolleri' : 'rolü'} başarıyla alındı.`
            })

            message.reply({ embeds: [embed] });
        } else {
            await member.roles.add(cmd.permRoles2).catch(() => { });

            const embed = new EmbedBuilder({
                author: { name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) },
                description: `${member} kullanıcısına ${cmd.permRoles2.map((role) => `<@&${role}>`).join(', ')} ${cmd.permRoles2.length > 1 ? 'rolleri' : 'rolü'} başarıyla verildi.`
            })

            message.reply({ embeds: [embed] });
        }
    }
}