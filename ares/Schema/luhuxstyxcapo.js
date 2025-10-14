

const mongoose = require('mongoose');

const model = mongoose.model('ares-guardsex', mongoose.Schema({
    guildID: { type: String, required: true },
    rolePermissions: { type: Array, default: [] },
}));

module.exports = model;