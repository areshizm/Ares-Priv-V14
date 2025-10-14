const { loadImage, createCanvas } = require('canvas');

module.exports = {
    name: 'ship',
    aliases: [],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        const channel = message.guild.channels.cache.get(ares.shipChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        let member = message.mentions.users.first() || client.guilds.cache.get(message.guild.id).members.cache.get(args[0])

        if (member && member.id === message.author.id) {
            message.reply({ content: '**O kadar mı yalnızsın yav**' })
            return;
        }

        if (!member || message.author.id === member.id) {
            member = message.guild.members.cache.random();
        }

    
        member = message.guild.members.cache.get(member.id);

        const percent = global.system.ownerID.includes(message.author.id) ? 100 : global.system.ownerID.includes(member.id) ? 100 : randomNumber(10, 100)

        const canvas = createCanvas(691, 244);
        const context = canvas.getContext('2d');

        context.fillStyle = '#3c3c3c';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#e31b23';
        context.fillRect(263, 194, 167, -((percent / 100) * 147));

        const backgroundBuffer = await loadImage('https://img001.prntscr.com/file/img001/JcUcEnDOQPyScXItAz18jA.jpg');
        context.drawImage(backgroundBuffer, 0, 0);

        const authorAvatarBuffer = await loadImage(message.author.displayAvatarURL({ extension: 'png', size: 4096 }));
        const targetAvatarBuffer = await loadImage(member.displayAvatarURL({ extension: 'png', size: 4096 }));
        context.drawImage(authorAvatarBuffer, 42, 38, 170, 170);
        context.drawImage(targetAvatarBuffer, 480, 38, 170, 170);

        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.font = 'normal 42px Kanit';
        context.fillText(`%${percent}`, 348, 130);

        message.channel.send({
            content: `[ **${member.displayName}** & **${message.member.displayName}** ]\n**${(createContent((percent * 100) / 100))}**`,
            files: [{ attachment: canvas.toBuffer(), name: 'ship.png' }],
        });
    }
}

function createContent(num) {
    if (num < 10) return 'Bizden olmaz...';
    if (num < 20) return 'Çok farklıyız...';
    if (num < 30) return 'Eksik bir şeyler var...';
    if (num < 40) return 'Sıradan biri gibi...';
    if (num < 50) return 'Aslında hoş biri...';
    if (num < 60) return 'Fena değil...';
    if (num < 70) return 'Bikahveye ne dersin ?';
    if (num < 80) return 'Çiğköfte & milkshake yapalım mı?';
    if (num < 90) return 'Beraber film izleyelim mi?';
    return 'Ev boş?';
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
