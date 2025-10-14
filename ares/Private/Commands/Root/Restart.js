module.exports = {
    name: 'restart',
    aliases: ['r'],
    category: 'Root',

    execute: async (client, message, args) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        await message.delete()
        process.exit(0);
    }
}