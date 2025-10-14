const mongoose = require('mongoose');

const model = mongoose.model('ares-user', mongoose.Schema({
    id: String,

    day: { type: Number, default: 1 },
    lastDayTime: { type: Number, default: () => new Date().setHours(0, 0, 0, 0) },

    voices: { type: Object, default: {} },
    messages: { type: Object, default: {} },
    streams: { type: Object, default: {} },
    cameras: { type: Object, default: {} },

    roleLogs: { type: Array, default: [] },

    inventory: { type: Object, default: { cash: 0 } },
    marriage: { type: Object, default: { active: false, married: undefined, date: undefined, ring: undefined } },
    games: { type: Object, default: { currentStreak: 0, maxStreak: 0, totalWins: 0, totalLosses: 0 } }
}))

module.exports = model;