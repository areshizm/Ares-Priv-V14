const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'tweetbuton',
    aliases: ['tweet'],
    category: 'Social',

    execute: async (client, message, args, ares, embed) => {
        const embed2 = new EmbedBuilder()
            .setTitle("Tweet At")
            .setDescription("Tweet oluşturmak için aşağıdaki butona tıklayın!")
            .setColor(0x1DA1F2);

        const openModalButton = new ButtonBuilder()
            .setCustomId('openTweetModal')
            .setLabel('Tweet At')
            .setStyle(ButtonStyle.Secondary);

        const initialRow = new ActionRowBuilder().addComponents(openModalButton);

        await message.channel.send({ embeds: [embed2], components: [initialRow] });
    }
}