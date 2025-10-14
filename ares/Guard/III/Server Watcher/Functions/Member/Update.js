const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function memberUpdate(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  if (safeMode?.isWarn) return;
  
  const user = guild.members.cache.get(audit.targetId)
  if (!user) return;
  user.timeout(null);
}