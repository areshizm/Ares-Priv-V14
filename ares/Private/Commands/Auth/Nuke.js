const { PermissionsBitField: { Flags }, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nuke',
    aliases: [],
    category: 'Auth',

    execute: async (client, message, args) => {
        if (!message.member.permissions.has(Flags.Administrator))
            return message.reply({ content: 'Yetkin yok.' });

        const channel = message.channel;
        const channelName = channel.name;
        const channelPosition = channel.position;
        const channelTopic = channel.topic;
        const channelNSFW = channel.nsfw;
        const channelRateLimit = channel.rateLimitPerUser;
        const channelParent = channel.parentId;
        const channelPermissions = channel.permissionOverwrites.cache.map(permission => {
            return {
                id: permission.id,
                type: permission.type,
                allow: permission.allow.bitfield,
                deny: permission.deny.bitfield
            };
        });

        try {
            await channel.delete();
            const newChannel = await channel.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                topic: channelTopic,
                nsfw: channelNSFW,
                rateLimitPerUser: channelRateLimit,
                parent: channelParent,
                permissionOverwrites: channelPermissions
            });

            newChannel.setPosition(channelPosition);
            return newChannel.send({
                embeds: [
                    new EmbedBuilder({
                        footer: { text: 'ares was here ❤️' },
                        description: `Kanal ${message.author} tarafından nukelendi!`
                    })
                ]
            });
        } catch (error) {
            return message.reply({ content: `Bir hata oluştu` });
        }
    }
}