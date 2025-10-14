const { checkWhitelist, createRole } = require('../../../../Utils/Functions.js');
const roleModel = require('../../../../../Schema/RoleModel.js');

module.exports = async function roleDelete(client, guild, audit, member, changes, ares) {
	const safeMode = await checkWhitelist(client, member, 'role');

	if (safeMode?.isWarn && !ares.blackListedRoles.includes(audit?.targetId)) {
		await roleModel.updateOne(
			{ guild: guild.id, role: audit.targetId },
			{ $set: { isDeleted: true, deletedTimestamp: Date.now() } },
			{ $upsert: true }
		);
		return;
	}

	const document = await roleModel.findOne({ role: audit.targetId });
	if (!document) return;

	await createRole(client, document);
};