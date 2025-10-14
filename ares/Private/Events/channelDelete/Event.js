const { Events, AuditLogEvent } = require('discord.js');
const Settings = require('../../../Schema/Settings');

client.on(Events.ChannelDelete, async (channel) => {
        const log = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
        const entry = log.entries.first();

        const user = entry.executor;
        if (!user || user.bot) return;

        const document = await Settings.findOne({ id: channel.guild.id });
        if (!document || !document.privateRooms) return;

        const secretRoom = document.privateRooms.find((x) => x.id === channel.id);
        if (!secretRoom) return;

        await Settings.updateOne({ id: channel.guild.id }, { $pull: { privateRooms: { id: channel.id } } });
})      