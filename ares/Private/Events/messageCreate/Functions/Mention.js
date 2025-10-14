let count = 0

module.exports = async function Mention(message) {
    count++
    if (count !== 50) return
    count = 0
    return;
    message.channel.send('<@774050856051277855> naber lan')
}