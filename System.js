const { ActivityType } = require('discord.js');

module.exports = {
    serverID: '',
    channelID: '',
    serverName: '',   
    ownerID: ["544120552596701226",""],
    database: 'mongodb://localhost:27017/areshizm',

    Presence: {
        Status: 'idle',
        Type: ActivityType.Watching,
        Message: [
            'ares was here ❤️',
        ]
    },

    Private: {
        Token: '',
        Prefix: ['.'],
    },

    Security: {
        Logger: '',
        Punish: '',
        Backup: '',
        Prefix: ['!'],
        Dists: [""],
        BotsIDs: ['','','','',''],
    },

    Welcome: {
        Tokens: [],
        Channels: []
    }
};