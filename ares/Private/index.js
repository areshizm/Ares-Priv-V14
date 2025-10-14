const { Client, Partials, GatewayIntentBits, Events, EmbedBuilder, ActivityType, Collection, ChannelType, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { readdir } = require('fs');
const Settings = require('../Schema/Settings')

const client = global.client = new Client({ intents: Object.keys(GatewayIntentBits), partials: Object.keys(Partials) });
const system = global.system = require('../../System');
const functions = global.functions = require('../Base/Functions');

const commands = client.commands = new Collection();
const afks = client.afks = new Collection();
const aliases = client.aliases = new Collection();
readdir('./Commands/', (err, files) => {
    if (err) console.error(err)
    files.forEach(f => {
        readdir('./Commands/' + f, (err2, files2) => {
            if (err2) console.log(err2)
            files2.forEach(file => {
                let arescum = require(`./Commands/${f}/` + file);
                commands.set(arescum.name, arescum);
                arescum.aliases.forEach(alias => { aliases.set(alias, arescum.name); });
            });
        });
    });

    console.log(`[COMMAND] Komutlar Yüklendi!`);
});

readdir('./Events/', (err, files) => {
    if (err) console.error(err)
    files.forEach(f => {
        readdir('./Events/' + f, (err2, files2) => {
            if (err2) console.log(err2)
            files2.forEach(file => {
                require(`./Events/${f}/` + file);
            });
        });
    });

    console.log(`[EVENT] Eventler Yüklendi!`);
});

client.on(Events.ClientReady, async () => {
    let message = system.Presence.Message[0] ? system.Presence.Message[Math.floor(Math.random() * system.Presence.Message.length)] : 'ares was here';

    client.user.setPresence({
        status: system.Presence.Status ? system.Presence.Status : 'online',
        activities: [
            {
                name: message,
                type: system.Presence.Type,
                url: 'https://www.twitch.tv/ares'
            },
        ],
    });

    const guild = client.guilds.cache.get(system.serverID);
    if (!guild) return;

    const channel = guild.channels.cache.get(system.channelID);
    if (!channel || channel.type !== ChannelType.GuildVoice) return;

    setInterval(async () => {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
    }, 20000);

    setInterval(async () => {

        const document = await Settings.findOne({ id: guild.id });
        if (!document) return;
        if (!document || !document.privateRooms) return;

        document.privateRooms.forEach(async (pr) => {
            const channel = guild.channels.cache.get(pr.channel);
            if (!channel) {
                await Settings.findOneAndUpdate({ id: guild.id }, { $pull: { privateRooms: { channel: pr.channel } } }, { upsert: true });
                return;
            }

            if (channel.members.size > 0) return;
            channel.delete().catch(() => null);
            await Settings.findOneAndUpdate({ id: guild.id }, { $pull: { privateRooms: { channel: pr.channel } } }, { upsert: true });
        });
    }, 10000);

    console.log(`[BOT] ${client.user.tag} olarak giriş yaptı!`);
});

const mongoose = require('mongoose');
mongoose.connect(system.database, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('[BOT] MongoDB bağlandı!')
}).catch((err) => {
    throw err;
});

client.login(system.Private.Token).catch((err) => {
    console.error(err);
});