const { Events } = require('discord.js');
const { Room, Stat } = require('./Functions');

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (!(oldState.member || !newState.member) || (oldState.member?.user.bot || newState.member?.user.bot) || !(oldState.guild || newState.guild) || (oldState.guild || newState.guild).id !== global.system.serverID) return;

    try {
        Room(client, oldState, newState);
        Stat(client, oldState, newState);
    } catch (error) {
        client.logger.error('@voiceStateUpdate', error);
    }
})