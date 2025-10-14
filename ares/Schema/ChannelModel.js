const { Model, Schema } = require('cherry3');

const model = new Model('ares-Channel', Schema({
    guild: String,
    channel: String,
    isDeleted: Boolean,
    deletedTimestamp: Number,
    name: String,
    type: Number,
    position: Number,
    permissionOverwrites: Array,
    messages: Array,
    bitrate: Number,
    userLimit: Number,
    parentId: String,
    topic: String,
    nsfw: Boolean,
    rateLimitPerUser: Number
}), { $timestamps: true });

module.exports = model;