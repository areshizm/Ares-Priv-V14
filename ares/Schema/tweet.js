const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
      authorUsername:  { type: String, required: true },
  authorAvatarURL: { type: String, required: true },
    tweetNo: { type: Number, unique: true, required: true },
    tweetId: { type: String, required: true, unique: true },
    content: { type: String, required: false, default: "" },
    likes: {
        type: [{ userId: String, username: String, likedAt: { type: Date, default: Date.now } }],
        default: []
    },
    retweets: {
        type: [{ userId: String, username: String, retweetedAt: { type: Date, default: Date.now } }],
        default: []
    },
    comments: { type: Number, default: 0 },
    dowlands: { type: Number, default: 0 },
    commentData: {
        type: [{ userId: String, username: String, comment: String, commentedAt: { type: Date, default: Date.now } }],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
    theme: { type: String, default: 'light' }
});

module.exports = mongoose.model('Tweet', tweetSchema);