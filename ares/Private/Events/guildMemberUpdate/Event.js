const { Events, AuditLogEvent, EmbedBuilder, codeBlock } = require('discord.js');
const UserModel = require('../../../Schema/User');

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.roles.cache.map((r) => r.id) === newMember.roles.cache.map((r) => r.id)) return;

    const entry = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate }).then((audit) => audit.entries.first());
    if (!entry || !entry.executor || entry.targetId !== newMember.id || Date.now() - entry.createdTimestamp > 5000) return;

    const role = oldMember.roles.cache.difference(newMember.roles.cache).first();
    const isRemove = oldMember.roles.cache.size > newMember.roles.cache.size;
    const now = Date.now();

    await UserModel.updateOne(
        { id: newMember.id },
        {
            $push: {
                roleLogs: {
                    type: isRemove ? 'remove' : 'add',
                    roles: [role?.id],
                    staff: entry.executor.id,
                    date: now
                }
            }
        },
        { upsert: true }
    );

    const channel = newMember.guild.channels.cache.find((r) => r.name === 'rol-log');
    if (!channel) return;

    channel.send({
        flags: [4096],
        embeds: [
            new EmbedBuilder({
                title: `Rol ${isRemove ? 'Çıkarıldı' : 'Eklendi'}! (Sağ Tık)`,
                fields: [
                    {
                        name: '\u200B',
                        value: codeBlock('yaml', [
                            `# Bilgilendirme`,
                            `→ Kullanıcı: ${newMember.user.username} (${newMember.id})`,
                            `→ Yetkili: ${entry.executor.username} (${entry.executor.id})`,
                            `→ Rol: ${role?.name} (${role?.id})`,
                            `→ Tarih: ${global.functions.date(now)}`
                        ].join('\n'))
                    }
                ]
            })
        ]
    });
})