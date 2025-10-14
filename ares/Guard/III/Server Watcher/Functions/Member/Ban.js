const { checkWhitelist, punish } = require('../../../../Utils/Functions.js');

module.exports = async function memberBan(client, guild, audit, member, changes) {
  const safeMode = await checkWhitelist(client, member, 'memberUpdate');
  if (safeMode?.isWarn) return;

  guild.members.unban(audit.targetId, { reason: 'ares ~ Güvenlik Sistemi' }).catch(err => { });
}