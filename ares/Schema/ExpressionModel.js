const { Model, Schema } = require('cherry3');

const model = new Model('ares-Expressions', Schema({
    guild: String,
    expression: String,
    name: String,
    type: Number,
    url: String,
    description: String,
    tags: String,
    animated: Boolean,
}), { $timestamps: true });

module.exports = model;