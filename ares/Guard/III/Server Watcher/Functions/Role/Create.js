const { checkWhitelist } = require('../../../../Utils/Functions.js');

module.exports = async function roleCreate(client, guild, audit, member, changes, ares) {
	const safeMode = await checkWhitelist(client, member, 'role');
	if (safeMode?.isWarn) return;
	
	guild.roles.cache.get(audit.targetId).delete({ reason: 'ares ~ Güvenlik Sistemi' });
};
