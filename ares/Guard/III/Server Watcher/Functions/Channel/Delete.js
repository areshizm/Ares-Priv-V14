const { GuildAuditLogsEntry, Guild } = require('discord.js');
const channelModel = require('../../../../../Schema/ChannelModel.js');
const { checkWhitelist, createChannel } = require('../../../../Utils/Functions.js');

module.exports = async function channelDelete(client, guild = Guild.prototype, audit = GuildAuditLogsEntry.prototype, member, changes, ares) {
	const safeMode = await checkWhitelist(client, member, 'channel');
	if (safeMode?.isWarn && !ares.blackListedChannels.includes(audit?.targetId)) {
		await channelModel.updateOne(
			{ guild: guild.id, channel: audit.targetId },
			{ $set: { isDeleted: true, deletedTimestamp: Date.now() } },
			{ $upsert: true }
		);
		return;
	}

	const document = await channelModel.findOne({ channel: audit.targetId });
	if (!document) return;

	await createChannel(client, document);
};