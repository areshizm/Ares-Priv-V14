const { Client, Partials, GatewayIntentBits, Events } = require('discord.js');
const { Welcome, serverID, Presence } = require('../../System');
const { joinVoiceChannel } = require('@discordjs/voice')

for (let ares = 0; ares < Welcome.Tokens.length; ares++) {
    const token = Welcome.Tokens[ares]
    const channel = Welcome.Channels.length > 0 ? Welcome.Channels[ares] : Welcome.Channels[0]

    if (token && channel) {
        const client = new Client({ intents: Object.keys(GatewayIntentBits), partials: Object.keys(Partials) })

        client.on(Events.ClientReady, () => {
            let message = Presence.Message[0] ? Presence.Message[Math.floor(Math.random() * Presence.Message.length)] : 'ares was here';

            client.user.setPresence({
                status: Presence.Status ? Presence.Status : 'online',
                activities: [
                    {
                        name: message,
                        type: Presence.Type,
                        url: 'https://www.twitch.tv/ares'
                    },
                ],
            });
            const Server = client.guilds.cache.get(serverID);
            const Channel = Server ? Server.channels.cache.get(channel) : null;

            if (!Server || !Channel) throw new Error('Sunucu veya kanal bulunamadı');

            joinVoiceChannel({
                channelId: Channel.id,
                guildId: Channel.guild.id,
                adapterCreator: Channel.guild.voiceAdapterCreator,
                group: client.user.id
            });
        });

        client.login(token).catch((err) => { throw new Error(err) })
        console.log(`Bot ${ares + 1} başlatıldı!`)
    }
}