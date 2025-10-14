const mongoose = require('mongoose');

const model = mongoose.model('ares-settings', mongoose.Schema({
    id: String,
    
    autoRole: { type: Boolean, default: false },
    genderSystem: { type: Boolean, default: false },
    linkGuard: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },

    privateRooms: { type: [Object], default: [] },
    specialCmds: { type: [Object], default: [] },
    snipeData: { type: [Object], default: [] },
    
    botCommandChannel: { type: String, default: '' },
    chatChannel: { type: String, default: '' },
    coinChannel: { type: String, default: '' },
    shipChannel: { type: String, default: '' },
    tweetChannel: { type: String, default: '' },
    secretRoomParent: { type: String, default: '' },
    secretRoomChannel: { type: String, default: '' },

    unregisteredRole: { type: String, default: '' },
    registeredRole: { type: String, default: '' },
    manRole: { type: String, default: '' },
    womanRole: { type: String, default: '' },
    familyRole: { type: String, default: '' }, 
    vipRole: { type: String, default: '' },

    banAuth: { type: [String], default: [] },
    timeOutAuth: { type: [String], default: [] },
    auth: { type: [String], default: [] },

}))

module.exports = model;