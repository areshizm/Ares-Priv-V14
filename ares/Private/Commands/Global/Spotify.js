const { PermissionsBitField: { Flags }, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: 'spotify',
    aliases: ['spo'],
    category: 'General',

    execute: async (client, message, args, ares, embed) => {
        try {
            const channel = message.guild.channels.cache.get(ares.botCommandChannel);
            if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

            await message.channel.sendTyping();

            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

            if (member && member.presence && member.presence.activities && member.presence.activities.some(activity => activity.name == 'Spotify' && activity.type == ActivityType.Listening)) {
                const status = await member.presence.activities.find(activity => activity.type == ActivityType.Listening);

                const songName = status.details;
                const artistName = status.state;
                const albumName = status.assets.largeText;
                const albumArt = `https://open.spotify.com/intl-tr/album/${status.assets.largeImage.slice(8)}`;
                const spotifyTrackId = status.syncId;
                const spotifyUrl = `https://open.spotify.com/track/${spotifyTrackId}`;

                const startTime = new Date(status.timestamps.start).getTime();
                const endTime = new Date(status.timestamps.end).getTime();
                const currentTime = new Date().getTime();
                const elapsedTime = currentTime - startTime;
                const totalDuration = endTime - startTime;

                const formatTime = (ms) => {
                    const seconds = Math.floor((ms / 1000) % 60);
                    const minutes = Math.floor((ms / (1000 * 60)) % 60);
                    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                };

                const currentTimeFormatted = formatTime(elapsedTime);
                const totalTimeFormatted = formatTime(totalDuration);
                const progressPercentage = Math.min(100, (elapsedTime / totalDuration) * 100);

                const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Gotham:wght@400;500;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: 'Gotham', 'Montserrat', sans-serif;
                            background-color: transparent;
                            overflow: hidden;
                        }
                        
                        .spotify-card {
                            width: 600px;
                            height: 220px;
                            background: #121212;
                            border-radius: 16px;
                            display: flex;
                            overflow: hidden;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                            position: relative;
                        }
                        
                        .card-bg {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(45deg, rgba(18, 18, 18, 0.6) 0%, rgba(18, 18, 18, 0.9) 100%);
                            z-index: 1;
                        }
                        
                        .album-art-container {
                            position: relative;
                            z-index: 2;
                            padding: 20px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .album-art {
                            width: 180px;
                            height: 180px;
                            background-size: cover;
                            background-position: center;
                            border-radius: 8px;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .album-art::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
                            pointer-events: none;
                        }
                        
                        .song-details {
                            flex: 1;
                            padding: 20px 25px;
                            color: white;
                            position: relative;
                            z-index: 2;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        
                        .now-playing {
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #1DB954;
                            margin-bottom: 8px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                        }
                        
                        .now-playing::before {
                            content: '';
                            display: inline-block;
                            width: 6px;
                            height: 6px;
                            background-color: #1DB954;
                            border-radius: 50%;
                            margin-right: 6px;
                            animation: pulse 1.5s infinite;
                        }
                        
                        @keyframes pulse {
                            0% { opacity: 0.6; transform: scale(0.9); }
                            50% { opacity: 1; transform: scale(1.1); }
                            100% { opacity: 0.6; transform: scale(0.9); }
                        }
                        
                        .song-title {
                            font-size: 28px;
                            font-weight: 700;
                            margin: 0;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            line-height: 1.2;
                            color: #FFFFFF;
                        }
                        
                        .artist-name {
                            font-size: 18px;
                            margin: 8px 0 0;
                            font-weight: 500;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            color: #B3B3B3;
                        }
                        
                        .album-name {
                            font-size: 14px;
                            color: #B3B3B3;
                            opacity: 0.8;
                            margin: 6px 0 0;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .player-controls {
                            margin-top: 22px;
                        }
                        
                        .progress-container {
                            width: 100%;
                            height: 4px;
                            background-color: rgba(255, 255, 255, 0.2);
                            border-radius: 50px;
                            margin-top: 15px;
                            overflow: hidden;
                        }
                        
                        .progress-bar {
                            height: 100%;
                            background-color: #1DB954;
                            border-radius: 50px;
                            width: ${progressPercentage}%;
                            position: relative;
                        }
                        
                        .progress-bar::after {
                            content: '';
                            position: absolute;
                            right: -5px;
                            top: 50%;
                            transform: translateY(-50%);
                            width: 10px;
                            height: 10px;
                            background-color: white;
                            border-radius: 50%;
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                            display: ${progressPercentage > 2 ? 'block' : 'none'};
                        }
                        
                        .time-details {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                            margin-top: 8px;
                            color: #B3B3B3;
                            font-weight: 500;
                        }
                        
                        .spotify-logo {
                            position: absolute;
                            bottom: 16px;
                            left: 20px;
                            width: 20px;
                            height: 20px;
                            z-index: 3;
                            opacity: 0.7;
                        }
                        
                        .user-info {
                            position: absolute;
                            top: 16px;
                            right: 20px;
                            font-size: 12px;
                            color: #B3B3B3;
                            z-index: 3;
                            background-color: rgba(0, 0, 0, 0.3);
                            padding: 4px 10px;
                            border-radius: 50px;
                            backdrop-filter: blur(5px);
                        }
                        
                        .user-info-icon {
                            display: inline-block;
                            width: 14px;
                            height: 14px;
                            background-color: #1DB954;
                            border-radius: 50%;
                            margin-right: 6px;
                            vertical-align: middle;
                            position: relative;
                            top: -1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="spotify-card">
                        <div class="card-bg" style="background-image: url('${albumArt}'); background-size: cover; background-position: center; filter: blur(30px); opacity: 0.4;"></div>
                        <div class="album-art-container">
                            <div class="album-art" style="background-image: url('${albumArt}')"></div>
                        </div>
                        <div class="song-details">
                            <div class="user-info"><span class="user-info-icon"></span>Dinleyen: ${member.displayName}</div>
                            <div class="now-playing">Şu anda çalıyor</div>
                            <h1 class="song-title">${songName}</h1>
                            <p class="artist-name">${artistName}</p>
                            <p class="album-name">${albumName}</p>
                            
                            <div class="player-controls">
                                <div class="progress-container">
                                    <div class="progress-bar"></div>
                                </div>
                                <div class="time-details">
                                    <span>${currentTimeFormatted}</span>
                                    <span>${totalTimeFormatted}</span>
                                </div>
                            </div>
                          
                        </div>
                    </div>
                </body>
                </html>
                `;


                const tempDir = os.tmpdir();
                const htmlPath = path.join(tempDir, `spotify-${message.author.id}.html`);
                const screenshotPath = path.join(tempDir, `spotify-${message.author.id}.png`);

                fs.writeFileSync(htmlPath, htmlTemplate);


                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
                    defaultViewport: {
                        width: 600,
                        height: 220,
                        deviceScaleFactor: 2
                    }
                });
                const page = await browser.newPage();
                await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
                await page.setViewport({ width: 600, height: 220 });
                await page.screenshot({
                    path: screenshotPath,
                    omitBackground: true,
                    clip: {
                        x: 0,
                        y: 0,
                        width: 600,
                        height: 220
                    }
                });
                await browser.close();

                const spotifyButton = new ButtonBuilder()
                    .setLabel('Dinle')
                    .setStyle(ButtonStyle.Link)
                    .setURL(spotifyUrl)


                const albumButton = new ButtonBuilder()
                    .setLabel('Albüm')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://open.spotify.com/album/${status.assets.largeImage.slice(8)}`)
                const artistButton = new ButtonBuilder()
                    .setLabel('Sanatçı')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://open.spotify.com/search/${encodeURIComponent(artistName)}`)



                const row = new ActionRowBuilder().addComponents(spotifyButton, albumButton, artistButton);

                await message.reply({
                    files: [{
                        attachment: screenshotPath,
                        name: `spotify-${message.author.id}.png`
                    }],
                    components: [row]
                });

                setTimeout(() => {
                    try {
                        fs.unlinkSync(htmlPath);
                        fs.unlinkSync(screenshotPath);
                    } catch (err) {
                        console.error('Temizlenirken hata oluştu:', err);
                    }
                }, 5000);

            } else {
                const errorEmbed = embed
                    .setDescription('Kullanıcı şu anda Spotify dinlemiyor.')
                    .setColor('#E74C3C')
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                return message.reply({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('Spotify:', error);
        }
    }
}