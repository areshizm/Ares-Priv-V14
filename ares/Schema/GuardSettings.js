const { Model, Schema } = require('cherry3');

const model = new Model('ares-guard-settings', Schema({
    guildID: { type: String, required: true },
    blackListedChannels: { type: Array, default: [] },
    blackListedRoles: { type: Array, default: [] },
    rolePermissions: { type: Array, default: [] },
    whitelist: { type: Array, default: [] },
}), { $timestamps: true });

module.exports = model;