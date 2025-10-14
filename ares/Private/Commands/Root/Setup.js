const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits, codeBlock, EmbedBuilder } = require('discord.js');
const Settings = require('../../../Schema/Settings');

module.exports = {
    name: 'setup',
    aliases: ['kur'],
    category: 'Root',

    execute: async (client, message, args, ares) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const setupEmbed = new EmbedBuilder({
            author: { name: message.guild.name, iconURL: message.guild.iconURL() },
            footer: { text: 'ares was here ❤️', iconURL: message.guild.iconURL() },
            description: [
                `${codeBlock('fix', '# Kurulum Seçenekleri')}`,
                `• Rol Kurulumu : Sunucu rollerini otomatik oluşturur`,
                `• Emoji Kurulumu : Gerekli emojileri yükler`,
                `• Log Kurulumu : Log kanallarını ayarlar`,
                '',
                `${codeBlock('fix', '# Sistem Durumu')}`,
                `${ares.autoRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>'} Otomatik Rol : ${ares.autoRole ? 'Aktif' : 'Devre Dışı'}`,
                `${ares.genderSystem ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>'} Cinsiyet Sistemi : ${ares.genderSystem ? 'Aktif' : 'Devre Dışı'}`,
                `${ares.linkGuard ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>'} Link Engel : ${ares.linkGuard ? 'Aktif' : 'Devre Dışı'}`,
                '',
                `${codeBlock('fix', '# Sunucu İstatistikleri')}`,
                `• Toplam Üye : ${message.guild.memberCount}`,
                `• Toplam Rol : ${message.guild.roles.cache.size}`,
                `• Toplam Kanal : ${message.guild.channels.cache.size}`,
            ].join('\n'),
        });

        const mainRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role-setup').setLabel('Rol Kurulumu').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('emoji-setup').setLabel('Emoji Kurulumu').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('log-setup').setLabel('Log Kurulumu').setStyle(ButtonStyle.Secondary),
        );

        const systemRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder('Sistemleri & Ayarları Güncellemek İçin Tıkla!')
                .setCustomId('systems')
                .addOptions([
                    { label: 'Otomatik Kayıt', value: 'autoRole', description: 'Sunucuya girene otomatik üye rolü verir.', emoji: ares.autoRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Cinsiyetli Kayıt', value: 'genderSystem', description: 'Cinsiyetli kayıt sistemnini açar kapatır', emoji: ares.genderSystem ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Link Engel', value: 'linkGuard', description: 'Link engel koruma açar kapatır.', emoji: ares.linkGuard ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                ]));

        const roleRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder('Rolleri Güncellemek İçin Tıkla!')
                .setCustomId('roles')
                .addOptions([
                    { label: 'Ban Yetkilileri', value: 'banAuth_array', description: '(Ban)', emoji: ares.banAuth && ares.banAuth.length > 0 ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Mute Yetkilileri', value: 'timeOutAuth_array', description: '(Timeout)', emoji: ares.timeOutAuth && ares.timeOutAuth.length > 0 ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Diğer Yetkililer', value: 'auth_array', description: '(Referans, Nuke, Sil, Vip, Kilit, Say, Rol)', emoji: ares.auth && ares.auth.length > 0 ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Vip Rolü', value: 'vipRole_string', description: 'Vip rolü.', emoji: ares.vipRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Family Rolü', value: 'familyRole_string', description: 'Family rolü.', emoji: ares.familyRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Erkek Rolü', value: 'manRole_string', description: 'Erkek rolü. (Cinsiyet Sistemini açman gerekir.)', emoji: ares.manRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Kadın Rolü', value: 'womanRole_string', description: 'Kadın rolü. (Cinsiyet Sistemini açman gerekir.)', emoji: ares.womanRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Kayıtlı Rolü', value: 'registeredRole_string', description: 'Kayıtlı rolü.', emoji: ares.registeredRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Kayıtsız Rolü', value: 'unregisteredRole_string', description: 'Kayıtsız rolü.', emoji: ares.unregisteredRole ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                ]));

        const channelRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder('Kanalları Güncellemek İçin Tıkla!')
                .setCustomId('channels')
                .addOptions([
                    { label: 'Chat Kanalı', value: 'chatChannel_text', description: 'Chat kanalı', emoji: ares.chatChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Bot Komut Kanalı', value: 'botCommandChannel_text', description: 'Botun komut aldığı kanal.', emoji: ares.botCommandChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Coin Kanalı', value: 'coinChannel_text', description: 'Ship kanalı.', emoji: ares.coinChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Ship Kanalı', value: 'shipChannel_text', description: 'Ship kanalı.', emoji: ares.shipChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Tweet Kanalı', value: 'tweetChannel_text', description: 'Ship kanalı.', emoji: ares.tweetChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Özel Oda Kanalı', value: 'secretRoomChannel_voice', description: 'Özel oda kanalı.', emoji: ares.secretRoomChannel ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                    { label: 'Özel Oda Kategorisi', value: 'secretRoomParent_category', description: 'Özel oda kategorisi.', emoji: ares.secretRoomParent ? '<a:check:1424152511299981515>' : '<a:mark:1424152516156985526>' },
                ]));

        const question = await message.reply({
            embeds: [setupEmbed],
            components: [mainRow, systemRow, roleRow, channelRow],
        });

        const filter = (i) => i.user.id === message.author.id;
        const collector = question.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 10,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'role-setup') {
                await roleSetup(message);
            }

            if (i.customId === 'emoji-setup') {
                await emojiSetup(message);
            }

            if (i.customId === 'log-setup') {
                await logSetup(message);
            }

            if (i.customId === 'roles') {
                await roles(message, ares, i.values[0]);
            }

            if (i.customId === 'channels') {
                await channels(message, i.values[0]);
            }

            if (i.customId === 'systems') {
                await systems(message, ares, i.values[0]);
            }
        });
    },
};

async function roles(message, ares, option) {
    const [key, type] = option.split('_');
    const row = new ActionRowBuilder().addComponents(
        new RoleSelectMenuBuilder()
            .setCustomId('roleSelect')
            .setMaxValues(type === 'array' ? 20 : 1)
    );

    const msg = await message.channel.send({
        content: `Güncellemek için tıklayın.`,
        components: [row],
        ephemeral: true,
    });

    const roleCollector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 1000 * 60 * 10,
    });

    roleCollector.on('collect', async (i) => {
        await i.deferUpdate();
        if (i.customId === 'roleSelect') {
            ares[key] = type === 'string' ? i.values[0] : i.values;
            await Settings.updateOne({ id: message.guild.id }, { [key]: ares[key] }, { upsert: true });
            msg.edit({ content: `Başarıyla güncellendi!`, components: [] }).then((m) => setTimeout(() => m.delete(), 5000));
        }
    });
}

async function channels(message, option) {
    const [key, type] = option.split('_');
    const row = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
            .setCustomId('channelSelect')
            .setChannelTypes(type === 'voice' ? ChannelType.GuildVoice : type === 'text' ? [ChannelType.GuildText] : [ChannelType.GuildCategory])
    );

    const msg = await message.channel.send({
        content: `Güncellemek için tıklayın.`,
        components: [row],
        ephemeral: true,
    });

    const channelCollector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 1000 * 60 * 10,
    });

    channelCollector.on('collect', async (i) => {
        await i.deferUpdate();
        if (i.customId === 'channelSelect') {
            await Settings.updateOne({ id: message.guild.id }, { [key]: i.values[0] }, { upsert: true });
            msg.edit({ content: `Başarıyla güncellendi!`, components: [] }).then((m) => setTimeout(() => m.delete(), 5000));
        }
    });
}

async function systems(message, ares, option) {
    ares[option] = !ares[option];
    await Settings.updateOne({ id: message.guild.id }, { [option]: ares[option] }, { upsert: true });
    message.reply({ content: 'Başarıyla güncellendi.' });
}

async function roleSetup(message) {

    const roles = [
        { name: 'Gri', color: '#7a7a7a' },
        { name: 'Siyah', color: '#090909' },
        { name: 'Beyaz', color: '#f9f8f8' },
        { name: 'Kırmızı', color: '#f50606' },
        { name: 'Mavi', color: '#2a9dff' },
        { name: 'Sarı', color: '#dfdb6a' },
        { name: 'Yeşil', color: '#37be66' },
        { name: 'Mor', color: '#a47dff' },
        { name: 'Turuncu', color: '#e98c00' },
        { name: 'Pembe', color: '#e996ff' },
        { name: 'Etkinlik Katılımcısı', color: '#7a7a7a' },
        { name: 'Çekiliş Katılımcısı', color: '#7a7a7a' },
    ]

    roles.forEach(async (role) => {
        const guildRole = message.guild.roles.cache.find(r => r.name === role.name);
        if (guildRole) return;
        await message.guild.roles.create({ name: role.name, color: role.color });
    });

    message.reply({ content: 'Roller başarıyla oluşturuldu.' });
}

async function emojiSetup(message) {

    const emojis = [
        { name: 'aresChange', url: 'https://cdn.discordapp.com/emojis/1280996856343826554.webp?size=80&quality=lossless' },
        { name: 'aresLimit', url: 'https://cdn.discordapp.com/emojis/1280996757773222042.webp?size=80&quality=lossless' },
        { name: 'aresLock', url: 'https://cdn.discordapp.com/emojis/1280996771169828944.webp?size=80&quality=lossless' },
        { name: 'aresVisible', url: 'https://cdn.discordapp.com/emojis/1280996886119055462.webp?size=80&quality=lossless' },
        { name: 'aresMember', url: 'https://cdn.discordapp.com/emojis/1280996814190809140.webp?size=80&quality=lossless' },
        { name: 'aresUp', url: 'https://cdn.discordapp.com/emojis/947134506488459274.gif?size=80&quality=lossless'},
        { name: 'aresDown', url: 'https://cdn.discordapp.com/emojis/947134506672996382.gif?size=80&quality=lossless'},
        { name: 'point', url: 'https://cdn.discordapp.com/emojis/1057358625972178974.webp?size=40&quality=lossless' },
        { name: 'nokta', url: 'https://cdn.discordapp.com/emojis/1359247880904245389.webp?size=96' },
        { name: 'adam', url: 'https://cdn.discordapp.com/emojis/1370075428802531420.webp?size=96' },
    ]

    emojis.forEach(async (e) => {
        const emoji = message.guild.emojis.cache.find(emoji => emoji.name === e.name);
        if (emoji) return;
        await message.guild.emojis.create({ attachment: e.url, name: e.name });
    });

    message.reply({ content: 'Emojiler başarıyla yüklendi.' });
}


async function logSetup(message) {
    const channels = [
        { name: 'guard-log' },
        { name: 'ban-log' },
        { name: 'mute-log' },
        { name: 'mesaj-log' },
        { name: 'giriş-çıkış-log' },
        { name: 'rol-log' },
    ];

    const logsCategory = await message.guild.channels.create({
        name: `${message.guild.name} | Logs`,
        type: ChannelType.GuildCategory,
        position: 99,
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel]
            }
        ]
    });

    for (const channel of channels) {
        const logChannel = message.guild.channels.cache.find(c => c.name === channel.name);
        if (logChannel) continue;

        await message.guild.channels.create({
            name: channel.name,
            type: ChannelType.GuildText,
            parent: logsCategory.id,
            permissionOverwrites: [
                {
                    id: message.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        });
    }

    message.reply({ content: 'Log kanalları başarıyla oluşturuldu.' });
}