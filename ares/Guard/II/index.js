const { Client, GatewayIntentBits, Partials, ActivityType, Events, AuditLogEvent, codeBlock, PermissionsBitField, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ChannelType, PermissionOverwriteManager, PermissionOverwrites } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../../../System');
const { channelCreate, channelDelete, channelUpdate, channelOverwriteCreate, channelOverwriteDelete, channelOverwriteUpdate, emojiCreate, emojiDelete, emojiUpdate, roleCreate, roleDelete, roleUpdate, stickerCreate, stickerDelete, stickerUpdate, webhookCreate, webhookDelete, webhookUpdate, memberBan, memberUnban, memberKick, memberRoleUpdate, memberUpdate, guildUpdate, botAdd } = require('./Server Watcher');
require('colors');
const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials),
    rest: { version: 10, hashLifetime: Infinity },
	presence: { status: config.Presence.Status, activities: [{ name: config.Presence.Message[Math.floor(Math.random() * config.Presence.Message.length)], type: config.Presence.Type, url: 'https://www.twitch.tv/arescuk' }] },
    ws: { version: 10, properties: { $browser: 'discord.js' } }
});


client.on(Events.ClientReady, async () => {

    const guild = client.guilds.cache.get(config.serverID);
    if (!guild) return;

    const channel = guild.channels.cache.get(config.channelID);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;

    setInterval(async () => {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
    }, 20000);
});

client.on(Events.GuildAuditLogEntryCreate, async (audit, guild) => {
    const type = audit.action;
    const changes = audit.changes;
    const member = guild.members.cache.get(audit?.executorId);

    if (type === AuditLogEvent.ChannelCreate) await channelCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.ChannelDelete) await channelDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.ChannelUpdate) await channelUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.ChannelOverwriteCreate) await channelOverwriteCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.ChannelOverwriteDelete) await channelOverwriteDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.ChannelOverwriteUpdate) await channelOverwriteUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.EmojiCreate) await emojiCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.EmojiDelete) await emojiDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.EmojiUpdate) await emojiUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.RoleCreate) await roleCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.RoleDelete) await roleDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.RoleUpdate) await roleUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.StickerCreate) await stickerCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.StickerDelete) await stickerDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.StickerUpdate) await stickerUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.WebhookCreate) await webhookCreate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.WebhookDelete) await webhookDelete(client, guild, audit, member, changes);
    if (type === AuditLogEvent.WebhookUpdate) await webhookUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.MemberBanAdd) await memberBan(client, guild, audit, member, changes);
    if (type === AuditLogEvent.MemberBanRemove) await memberUnban(client, guild, audit, member, changes);
    if (type === AuditLogEvent.MemberKick) await memberKick(client, guild, audit, member, changes);
    if (type === AuditLogEvent.MemberRoleUpdate) await memberRoleUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.MemberUpdate) await memberUpdate(client, guild, audit, member, changes);
    if (type === AuditLogEvent.BotAdd) await botAdd(client, guild, audit, member, changes);
    if (type === AuditLogEvent.GuildUpdate) await guildUpdate(client, guild, audit, member, changes);
});

client.login(config.Security.Punish).then(() => { console.log(`[BOT] ${client.user.tag} olarak giriş yaptı!`) }).catch((err) => { console.log(`[Logger] Başlatılamadı! Hata: ${err}`) });