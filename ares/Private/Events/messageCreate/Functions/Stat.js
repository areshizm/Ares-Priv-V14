module.exports = async function Stat(client, message) {
    global.functions.addStat({
        type: 'message',
        member: message.author,
        message: message,
    })
}