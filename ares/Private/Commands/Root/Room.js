const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'özeloda',
    aliases: ['ozeloda'],
    category: 'Root',

    execute: async (client, message, args) => {
        if (!global.system.ownerID.includes(message.author.id)) return;

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('changeName')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('1279921117838184529'),
                new ButtonBuilder()
                    .setCustomId('changeLimit')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('1279920708117331998'),
                new ButtonBuilder()
                    .setCustomId('lockOrUnlock')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('1279921052872609864'),
                new ButtonBuilder()
                    .setCustomId('visibleOrInvisible')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('1279921134040645694'),
                new ButtonBuilder()
                    .setCustomId('addOrRemove')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('1279922837758545931'),
            );

        const imagePath = await generateRoomPanel(client);

        const attachment = new AttachmentBuilder(imagePath, { name: 'room-panel.png' });

        await message.channel.send({
            files: [attachment],
            components: [buttonRow]
        });

        try {
            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Error deleting temporary image:', error);
        }
    }
};

async function generateRoomPanel(client) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 800, height: 700 });

    const changeEmoji = client.emojis.cache.find(emoji => emoji.name === 'aresChange')?.url;
    const limitEmoji = client.emojis.cache.find(emoji => emoji.name === 'aresLimit')?.url;
    const lockEmoji = client.emojis.cache.find(emoji => emoji.name === 'aresLock')?.url;
    const visibleEmoji = client.emojis.cache.find(emoji => emoji.name === 'aresVisible')?.url;
    const memberEmoji = client.emojis.cache.find(emoji => emoji.name === 'aresMember')?.url;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                font-family: 'Montserrat', sans-serif;
                background: radial-gradient(ellipse at center, #0f0c29 0%, #302b63 50%, #24243e 100%);
                color: #ffffff;
                width: 800px;
                height: 700px;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            
            .container {
                width: 700px;
                background: rgba(15, 14, 40, 0.7);
                border-radius: 20px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                padding: 20px;
                position: relative;
                overflow: hidden;
                z-index: 1;
            }
            
            .background-grid {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                background-size: 20px 20px;
                z-index: -1;
            }
            
            .glow {
                position: absolute;
                border-radius: 50%;
                filter: blur(80px);
                z-index: 0;
                opacity: 0.6;
                animation: pulse 8s infinite alternate;
            }
            
            .glow-1 {
                top: -100px;
                right: -100px;
                width: 300px;
                height: 300px;
                background: rgba(123, 31, 162, 0.5);
                animation-delay: 0s;
            }
            
            .glow-2 {
                bottom: -100px;
                left: -100px;
                width: 350px;
                height: 350px;
                background: rgba(32, 156, 238, 0.5);
                animation-delay: 2s;
            }
            
            .glow-3 {
                top: 40%;
                left: 50%;
                width: 200px;
                height: 200px;
                background: rgba(252, 70, 107, 0.3);
                animation-delay: 4s;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 0.5;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(1);
                    opacity: 0.5;
                }
            }
            
            @keyframes float {
                0% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-15px);
                }
                100% {
                    transform: translateY(0px);
                }
            }
            
            .header {
                text-align: center;
                margin-bottom: 15px;
                position: relative;
                z-index: 2;
            }
            
            .header-content {
                padding: 8px;
                border-radius: 15px;
                position: relative;
                background: rgba(0, 0, 0, 0.2);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                overflow: hidden;
            }
            
            .header-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
                border-radius: 3px 3px 0 0;
            }
            
            h1 {
                font-size: 28px;
                margin: 0;
                background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
                from {
                    text-shadow: 0 0 10px rgba(252, 70, 107, 0.7), 0 0 20px rgba(252, 70, 107, 0.5);
                }
                to {
                    text-shadow: 0 0 15px rgba(63, 94, 251, 0.7), 0 0 25px rgba(63, 94, 251, 0.5);
                }
            }
            
            .options-container {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 15px;
                padding: 15px;
                position: relative;
                z-index: 2;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .option {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                background: rgba(20, 20, 40, 0.7);
                border-radius: 12px;
                padding: 10px 15px;
                transition: all 0.4s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
                animation: slideIn 0.5s ease forwards;
                opacity: 0;
            }
            
            .option:nth-child(1) { animation-delay: 0.1s; }
            .option:nth-child(2) { animation-delay: 0.2s; }
            .option:nth-child(3) { animation-delay: 0.3s; }
            .option:nth-child(4) { animation-delay: 0.4s; }
            .option:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes slideIn {
                from {
                    transform: translateX(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .option::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 4px;
                background: linear-gradient(to bottom, #FC466B, #3F5EFB);
                border-radius: 2px 0 0 2px;
                transition: all 0.4s ease;
            }
            
            .option::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, rgba(252, 70, 107, 0.1) 0%, rgba(63, 94, 251, 0.1) 100%);
                opacity: 0;
                transition: opacity 0.4s ease;
                z-index: -1;
            }
            
            .option:hover {
                transform: translateX(5px) translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }
            
            .option:hover::before {
                width: 8px;
                background: linear-gradient(to bottom, #FF8A00, #FF2E63);
            }
            
            .option:hover::after {
                opacity: 1;
            }
            
            .option-icon {
                width: 35px;
                height: 35px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 15px;
                background: linear-gradient(135deg, rgba(252, 70, 107, 0.2) 0%, rgba(63, 94, 251, 0.2) 100%);
                border-radius: 50%;
                padding: 8px;
                position: relative;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: all 0.4s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .option:hover .option-icon {
                transform: scale(1.1) rotate(5deg);
                background: linear-gradient(135deg, rgba(255, 138, 0, 0.2) 0%, rgba(255, 46, 99, 0.2) 100%);
            }
            
            .option-icon img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
                transition: all 0.4s ease;
            }
            
            .option:hover .option-icon img {
                transform: scale(1.1);
                filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5)) brightness(1.2);
            }
            
            .option-text {
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.5px;
                background: linear-gradient(90deg, #ffffff 0%, #c8c8c8 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                transition: all 0.4s ease;
            }
            
            .option:hover .option-text {
                background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                transform: translateX(5px);
            }
            
            .option-highlight {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
                opacity: 0;
                transition: all 0.4s ease;
            }
            
            .option:hover .option-highlight {
                opacity: 1;
                box-shadow: 0 0 10px rgba(252, 70, 107, 0.5), 0 0 20px rgba(63, 94, 251, 0.5);
                animation: pulse-highlight 1.5s infinite;
            }
            
            @keyframes pulse-highlight {
                0% {
                    transform: translateY(-50%) scale(1);
                    opacity: 0.8;
                }
                50% {
                    transform: translateY(-50%) scale(1.5);
                    opacity: 0.5;
                }
                100% {
                    transform: translateY(-50%) scale(1);
                    opacity: 0.8;
                }
            }
            
            .footer {
                text-align: center;
                margin-top: 25px;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 1px;
                position: relative;
                z-index: 2;
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 30px;
                display: inline-block;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            }
            
            .footer span {
                background: linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }
            
            .particle {
                position: absolute;
                width: 2px;
                height: 2px;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
            }
            
            .shooting-star {
                position: absolute;
                width: 100px;
                height: 2px;
                background: linear-gradient(90deg, rgba(252, 70, 107, 0), rgba(252, 70, 107, 1));
                transform: rotate(-45deg);
                filter: blur(1px);
                animation: shooting 10s linear infinite;
                opacity: 0;
            }
            
            .shooting-star:before {
                content: '';
                position: absolute;
                right: 0;
                width: 10px;
                height: 10px;
                background: rgba(252, 70, 107, 1);
                border-radius: 50%;
                filter: blur(4px);
                transform: translateX(50%) translateY(-50%);
            }
            
            @keyframes shooting {
                0% {
                    transform: translateX(-500px) translateY(500px) rotate(-45deg);
                    opacity: 1;
                }
                100% {
                    transform: translateX(1000px) translateY(-1000px) rotate(-45deg);
                    opacity: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="particles">
            <div class="shooting-star" style="top: 20%; left: 10%; animation-delay: 0s;"></div>
            <div class="shooting-star" style="top: 60%; left: 40%; animation-delay: 4s;"></div>
            <div class="shooting-star" style="top: 30%; left: 60%; animation-delay: 8s;"></div>
        </div>
        
        <div class="container">
            <div class="background-grid"></div>
            <div class="glow glow-1"></div>
            <div class="glow glow-2"></div>
            <div class="glow glow-3"></div>
            
            <div class="header">
                <div class="header-content">
                    <h1>Oda Yönetim Paneli</h1>
                </div>
            </div>
            
            <div class="options-container">
                <div class="option">
                    <div class="option-icon">
                        <img src="${changeEmoji || 'https://cdn.discordapp.com/emojis/1279921117838184529.webp'}" alt="Change" />
                    </div>
                    <div class="option-text">Odanın İsmini Değiştir</div>
                    <div class="option-highlight"></div>
                </div>
                
                <div class="option">
                    <div class="option-icon">
                        <img src="${limitEmoji || 'https://cdn.discordapp.com/emojis/1279920708117331998.webp'}" alt="Limit" />
                    </div>
                    <div class="option-text">Odanın Limitini Değiştir</div>
                    <div class="option-highlight"></div>
                </div>
                
                <div class="option">
                    <div class="option-icon">
                        <img src="${lockEmoji || 'https://cdn.discordapp.com/emojis/1279921052872609864.webp'}" alt="Lock" />
                    </div>
                    <div class="option-text">Odayı Kilitle/Kilidi Aç</div>
                    <div class="option-highlight"></div>
                </div>
                
                <div class="option">
                    <div class="option-icon">
                        <img src="${visibleEmoji || 'https://cdn.discordapp.com/emojis/1279921134040645694.webp'}" alt="Visible" />
                    </div>
                    <div class="option-text">Odayı Gizle/Gizliyi Aç</div>
                    <div class="option-highlight"></div>
                </div>
                
                <div class="option">
                    <div class="option-icon">
                        <img src="${memberEmoji || 'https://cdn.discordapp.com/emojis/1279922837758545931.webp'}" alt="Member" />
                    </div>
                    <div class="option-text">Odaya Kişi Ekle/Çıkar</div>
                    <div class="option-highlight"></div>
                </div>
            </div>
            
            <div class="footer">
                made by <span>ares</span> ❤️
            </div>
        </div>
        
        <script>
            // Create particles
            const particlesContainer = document.querySelector('.particles');
            const particleCount = 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Random position
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                
                // Random size
                const size = Math.random() * 3;
                
                // Random opacity
                const opacity = Math.random() * 0.5 + 0.3;
                
                // Random animation duration
                const duration = Math.random() * 20 + 10;
                
                // Set styles
                particle.style.left = posX + '%';
                particle.style.top = posY + '%';
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.opacity = opacity;
                particle.style.animation = \`twinkle \${duration}s infinite\`;
                
                // Add to container
                particlesContainer.appendChild(particle);
            }
            
            // Add animation to style
            const style = document.createElement('style');
            style.innerHTML = \`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 1; }
                }
            \`;
            document.head.appendChild(style);
        </script>
    </body>
    </html>
    `;

    await page.setContent(html);

    const tempDir = path.join(__dirname, '../temp');
    try {
        await fs.mkdir(tempDir, { recursive: true });
    } catch (error) {
        console.error('Error creating temp directory:', error);
    }

    const imagePath = path.join(tempDir, `room-panel-${Date.now()}.png`);
await new Promise(resolve => setTimeout(resolve, 1500));
    await page.screenshot({
        path: imagePath,
        type: 'png',
        fullPage: true
    });

    await browser.close();

    return imagePath;
}

function findEmoji(client, name) {
    return client.emojis.cache.find(emoji => emoji.name === name);
}