const { Events, ModalBuilder, time,ActionRowBuilder, TextInputStyle, TextInputBuilder, AttachmentBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, EmbedBuilder, BaseInteraction, PermissionFlagsBits, bold, ButtonBuilder, ButtonStyle } = require('discord.js');
const Settings = require('../../../Schema/Settings');
const Tweet = require('../../../Schema/tweet');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9\-]{2,32})\b/;
const adsRegex = /([^a-zA-ZIıİiÜüĞğŞşÖöÇç\s])+/gi;
const roles = {
    gri: 'Gri',
    siyah: 'Siyah',
    beyaz: 'Beyaz',
    kırmızı: 'Kırmızı',
    mavi: 'Mavi',
    sarı: 'Sarı',
    yeşil: 'Yeşil',
    mor: 'Mor',
    turuncu: 'Turuncu',
    pembe: 'Pembe',
    etkinlik: 'Etkinlik Katılımcısı',
    çekiliş: 'Çekiliş Katılımcısı'
};

client.on(Events.InteractionCreate, async (i = BaseInteraction.prototype) => {

    const document = await Settings.findOne({ id: i.guild.id });
    if (!document) return;

     if (i.customId === 'command_category') {
       const category = i.values[0];
        
        const filteredCommands = client.commands.filter(cmd => cmd.category === category);
        
        if (filteredCommands.size === 0) {
            return i.reply({
                content: `${category} kategorisinde hiç komut bulunamadı.`,
                ephemeral: true
            });
        }

        let commandList = '';
        
        filteredCommands.forEach(cmd => {
            commandList += `**.${cmd.name}**: ${cmd.description || 'Açıklama yok'}\n`;
        });

        let categoryTitle = "";
        let categoryEmoji = "";
        
        switch(category) {
            case 'General':
                categoryTitle = "Kullanıcı Komutları";
                break;
            case 'Economy':
                categoryTitle = "Eğlence Komutları";
                break;
            case 'Auth':
                categoryTitle = "Üst Komutları";
                break;
            case 'Root':
                categoryTitle = "Owner Komutları";
                break;
            default:
                categoryTitle = "Komutlar";
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${categoryTitle}`)
            .setDescription(commandList)
            .setFooter({ text: `Toplam ${filteredCommands.size} komut listelendi` })

        await i.reply({
            embeds: [embed],
            ephemeral: true
        });

        }
    
    if (i.customId === 'like' || i.customId.startsWith('like_')) {
        const [action, tweetId] = i.customId.split('_');
        if (!tweetId) return;

        const tweet = await Tweet.findOne({ tweetId });
        await handleLike(i, tweet);
    }
    if (i.customId === 'retweet' || i.customId.startsWith('retweet_')) {
        const [action, tweetId] = i.customId.split('_');
        if (!tweetId) return;

        const tweet = await Tweet.findOne({ tweetId });
        await handleRetweet(i, tweet);
    }
    if (i.customId === 'yorum' || i.customId.startsWith('yorum_')) {
        const [action, tweetId] = i.customId.split('_');
        if (!tweetId) return;

        const tweet = await Tweet.findOne({ tweetId });
        await openCommentModal(i, tweet);
    }
    if (i.customId === 'interactions' || i.customId.startsWith('interactions_')) {
        const [action, tweetId] = i.customId.split('_');
        if (!tweetId) return;

        const tweet = await Tweet.findOne({ tweetId });
        await showInteractions(i, tweet);
    }
    if (i.customId === 'commentModal' || i.customId.startsWith('commentModal_')) {
        const tweetId = i.customId.split('_')[1];
        await handleComment(i, tweetId);
    }
    if (i.customId === 'openTweetModal') {
        const modal = new ModalBuilder()
            .setCustomId('tweetModal')
            .setTitle('Tweetinizi Yazın');

        const tweetInput = new TextInputBuilder()
            .setCustomId('tweetContent')
            .setLabel('Tweet içeriği')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Tweetinizin içeriğini girin...')
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('tweetImage')
            .setLabel('Hashtagler veya etiketler')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#1337 @ares')
            .setRequired(false);

        const imageTema = new TextInputBuilder()
            .setCustomId('tweetTema')
            .setLabel('Tema Seçimi')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('light, dark, blue')
            .setRequired(false);

        const row1 = new ActionRowBuilder().addComponents(tweetInput);
        const row2 = new ActionRowBuilder().addComponents(imageInput);
        const row3 = new ActionRowBuilder().addComponents(imageTema);

        modal.addComponents(row1, row2, row3);
        await i.showModal(modal);
    }
if (i.customId === 'tweetModal') {
  await i.deferReply({ ephemeral: true });
  const content = i.fields.getTextInputValue('tweetContent');
  const links   = i.fields.getTextInputValue('tweetImage') || '';
  const theme   = i.fields.getTextInputValue('tweetTema') || 'light';
  const validTheme = ['light', 'dark', 'blue']
    .includes(theme.toLowerCase())
      ? theme.toLowerCase()
      : 'light';

  const tweetId  = uuidv4();
  const lastTweet = await Tweet.findOne().sort({ tweetNo: -1 });
  const tweetNo  = lastTweet ? lastTweet.tweetNo + 1 : 1;

  const author = i.user;  

  const newTweet = new Tweet({
    tweetNo,
    tweetId,
    content,
    links,
    theme: validTheme,
    createdAt: new Date(),
    authorUsername:  author.username,
    authorAvatarURL: author.displayAvatarURL({
      format: 'png', dynamic: false, size: 128
    }),
    likes:      [],
    retweets:   [],
    commentData: [],
    comments:   0
  });
  await newTweet.save();
  const tweetImage = await createTweetImage(
    newTweet.authorUsername,
    newTweet.authorAvatarURL,
    content,
    links,
    newTweet.createdAt,
    validTheme,
    newTweet 
  );

  const attachment = new AttachmentBuilder(tweetImage, {
    name: `tweet-${tweetId}.png`
  });
  const interactionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`yorum_${tweetId}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Yorum Yap'),
    new ButtonBuilder()
      .setCustomId(`retweet_${tweetId}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Retweet'),
    new ButtonBuilder()
      .setCustomId(`like_${tweetId}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Beğen'),
    new ButtonBuilder()
      .setCustomId(`interactions_${tweetId}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Etkileşimler'),
  );

  await i.editReply({ content: 'Tweetiniz başarıyla oluşturuldu!', components: [] });
  await i.channel.send({
    files:      [attachment],
    components: [interactionRow]
  });
}
    if (i.isButton()) {

        for (const [id, name] of Object.entries(roles)) {
            if (i.customId === id) {
                const role = i.guild.roles.cache.find(x => x.name === name);
                if (i.member.roles.cache.find(x => x.name === name)) {
                    i.member.roles.remove(role);
                    await i.reply({ content: `${role.name} rolü üzerinden alındı.`, ephemeral: true });
                } else {
                    i.member.roles.add(role);
                    await i.reply({ content: `${role.name} rolü üzerine verildi.`, ephemeral: true });
                }
            }
        }
     if (i.customId === 'kısayolI') {
     return i.reply({
            ephemeral: true,
            content:`Hesabınızın oluşturulma tarihi: ${time(Math.floor(i.member.user.createdTimestamp / 1000))} (${time(Math.floor(i.member.user.createdTimestamp / 1000), 'R',)})`

        });
       }
        if (i.customId === 'kısayolII') {
             return i.reply({
            ephemeral: true,
            content:`Sunucuya katılma tarihiniz: ${time(Math.floor(i.member.joinedTimestamp / 1000))} (${time(Math.floor(i.member.joinedTimestamp / 1000), 'R',)})`
          
        });
        }
        if (i.customId === 'kısayolIII') {
              return i.reply({
            ephemeral: true,
            content:`Üstünüzde bulunan roller: ${i.member.roles.cache.filter((r) => r.id !== member.guild.id).map(r => r.toString()).listArray() || 'Yok'}`
        });
            
        }
        if (i.customId === 'register') {
            if (!i.member.roles.cache.has(document.registeredRole)) {
                i.member.roles.add(document.registeredRole);
                i.member.roles.remove(document.unregisteredRole);
                const counter = await Settings.findOneAndUpdate({ id: i.guild.id }, { $inc: { clickCount: 1 } });

                const row = new ActionRowBuilder({
                    components: [
                        new ButtonBuilder()
                            .setCustomId('register')
                            .setLabel(`Kayıt Ol - ${counter.clickCount}`)
                            .setStyle(ButtonStyle.Secondary)
                    ]
                });

                await i.reply({ content: 'Kayıt oldunuz!', ephemeral: true });
                await i.message.edit({ components: [row] });

                const chatChannel = i.guild.channels.cache.get(document.chatChannel);

                if (chatChannel && chatChannel.isTextBased()) {
                    chatChannel.send({
                        content: `${findEmoji(client, 'nokta')}${i.member} Sunucumuza Hoş Geldin!\n${findEmoji(client, 'adam')} Seninle beraber **${message.guild.memberCount}** kişi olduk.`
                    })
                        .then(msg => {
                            setTimeout(() => {
                                msg.delete().catch(console.error);
                            }, 10000);
                        })
                        .catch(console.error);
                }

            } else {
                await i.reply({ content: 'Zaten kayıtlısınız.', ephemeral: true });
            }
        }


        const member = i.guild.members.cache.get(i.user.id);
        const channel = i.guild.channels.cache.get(member.voice.channelId);
        const existingRoom = (document.privateRooms || []).find(x => x.channel === channel?.id);
        const owner = i.guild.members.cache.get(existingRoom?.owner);
        const isOwnerVoice = owner?.voice?.channel?.id === channel?.id;
        const isOwner = owner?.id === i.user.id;

        if (i.customId === 'changeName') {
            if (!member.voice.channel) return i.reply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ], ephemeral: true
            });

            if (channel?.parentId === document.secretRoomParent && !isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. Oda sahibi odada olmadığı için aşağıdaki butonu kullanabilir.'
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder({
                                customId: 'claimOwnership',
                                label: 'Odayı Sahiplen',
                                style: ButtonStyle.Primary
                            })
                        )
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId === document.secretRoomParent && isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. '
                        })
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId !== document.secretRoomParent) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Hata!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: `Özel oda kategorisinde olmayan bir kanalda bu işlemi gerçekleştiremezsiniz. Lütfen bir özel oda kanalında deneyin:\n\n <#${document.secretRoomChannel}>`
                        })
                    ],
                    ephemeral: true
                });
            }

            const row = new ModalBuilder()
                .setTitle('İsim Değiştir')
                .setCustomId('changingName')
                .setComponents(
                    new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId('channelName').setLabel('Oda ismini giriniz.').setStyle(TextInputStyle.Short)),
                );

            i.showModal(row)

            const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 * 2 });
            const channelName = modalCollected.fields.getTextInputValue('channelName');

            if (modalCollected) {
                if (channelName.match(inviteRegex)) return modalCollected.reply({ content: 'Özel oda isminde link kullanamazsınız.', ephemeral: true });
                if (channelName.match(adsRegex)) return modalCollected.reply({ content: 'Özel oda isminde reklam yapamazsınız.', ephemeral: true });

                await channel.setName(channelName).catch((err) => console.error())

                modalCollected.reply({
                    content: `Oda ismi başarıyla değiştirildi: ${bold(channelName)}`,
                    ephemeral: true
                });
            };
        }

        if (i.customId === 'changeLimit') {
            if (!member.voice.channel) return i.reply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ], ephemeral: true
            });

            if (channel?.parentId === document.secretRoomParent && !isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. Oda sahibi odada olmadığı için aşağıdaki butonu kullanabilir.'
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder({
                                customId: 'claimOwnership',
                                label: 'Odayı Sahiplen',
                                style: ButtonStyle.Primary
                            })
                        )
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId === document.secretRoomParent && isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. '
                        })
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId !== document.secretRoomParent) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Hata!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: `Özel oda kategorisinde olmayan bir kanalda bu işlemi gerçekleştiremezsiniz. Lütfen bir özel oda kanalında deneyin:\n\n <#${document.secretRoomChannel}>`
                        })
                    ],
                    ephemeral: true
                });
            }

            const row = new ModalBuilder()
                .setTitle('Limit Değiştir')
                .setCustomId('changingLimit')
                .setComponents(
                    new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId('channelLimit').setLabel('Oda limitini giriniz.').setStyle(TextInputStyle.Short)),
                );

            i.showModal(row)

            const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 * 2 });
            const channelLimit = modalCollected.fields.getTextInputValue('channelLimit');

            if (modalCollected) {
                if (isNaN(channelLimit)) return modalCollected.reply({ content: 'Geçerli bir limit belirtmelisiniz.', ephemeral: true });

                await channel.setUserLimit(channelLimit).catch((err) => console.error())

                modalCollected.reply({
                    content: `Oda limiti başarıyla değiştirildi: ${bold(channelLimit)}`,
                    ephemeral: true
                });
            }
        }

        if (i.customId === 'lockOrUnlock') {
            if (!member.voice.channel) return i.reply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ], ephemeral: true
            });

            if (channel?.parentId === document.secretRoomParent && !isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. Oda sahibi odada olmadığı için aşağıdaki butonu kullanabilir.'
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder({
                                customId: 'claimOwnership',
                                label: 'Odayı Sahiplen',
                                style: ButtonStyle.Primary
                            })
                        )
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId === document.secretRoomParent && isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. '
                        })
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId !== document.secretRoomParent) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Hata!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: `Özel oda kategorisinde olmayan bir kanalda bu işlemi gerçekleştiremezsiniz. Lütfen bir özel oda kanalında deneyin:\n\n <#${document.secretRoomChannel}>`
                        })
                    ],
                    ephemeral: true
                });
            }

            const permissions = channel.permissionOverwrites.cache.get(i.guild.id);

            if (permissions && permissions.deny.has(PermissionFlagsBits.Connect)) {
                await channel.permissionOverwrites.edit(i.guild.id, { 1048576: true });
                i.reply({ content: 'Kanal herkese açıldı.', ephemeral: true });
            } else {
                await channel.permissionOverwrites.edit(i.guild.id, { 1048576: false });
                i.reply({ content: 'Kanal herkese kapatıldı.', ephemeral: true });
            }
        }

        if (i.customId === 'visibleOrInvisible') {
            if (!member.voice.channel) return i.reply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ], ephemeral: true
            });

            if (channel?.parentId === document.secretRoomParent && !isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. Oda sahibi odada olmadığı için aşağıdaki butonu kullanabilir.'
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder({
                                customId: 'claimOwnership',
                                label: 'Odayı Sahiplen',
                                style: ButtonStyle.Primary
                            })
                        )
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId === document.secretRoomParent && isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. '
                        })
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId !== document.secretRoomParent) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Hata!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: `Özel oda kategorisinde olmayan bir kanalda bu işlemi gerçekleştiremezsiniz. Lütfen bir özel oda kanalında deneyin:\n\n <#${document.secretRoomChannel}>`
                        })
                    ],
                    ephemeral: true
                });
            }

            const permissions = channel.permissionOverwrites.cache.get(i.guild.id);

            if (permissions && permissions.deny.has(PermissionFlagsBits.ViewChannel)) {
                await channel.permissionOverwrites.edit(i.guild.id, { 1024: true });
                i.reply({ content: 'Kanal herkese görünür yapıldı.', ephemeral: true });
            } else {
                await channel.permissionOverwrites.edit(i.guild.id, { 1024: false });
                i.reply({ content: 'Kanal herkese gizlendi.', ephemeral: true });
            }
        }

        if (i.customId === 'addOrRemove') {
            if (!member.voice.channel) return i.reply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ], ephemeral: true
            });

            if (channel?.parentId === document.secretRoomParent && !isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. Oda sahibi odada olmadığı için aşağıdaki butonu kullanabilir.'
                        })
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder({
                                customId: 'claimOwnership',
                                label: 'Odayı Sahiplen',
                                style: ButtonStyle.Primary
                            })
                        )
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId === document.secretRoomParent && isOwnerVoice && !isOwner) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Mümkün değil!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: 'Bu komutu, yalnızca ses kanalının sahibi kullanabilir. '
                        })
                    ],
                    ephemeral: true
                });
            } else if (channel?.parentId !== document.secretRoomParent) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder({
                            title: 'Hata!',
                            image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                            description: `Özel oda kategorisinde olmayan bir kanalda bu işlemi gerçekleştiremezsiniz. Lütfen bir özel oda kanalında deneyin:\n\n <#${document.secretRoomChannel}>`
                        })
                    ],
                    ephemeral: true
                });
            }

            const allowedUsers = channel.permissionOverwrites.cache.filter(overwrite =>
                overwrite.allow.has(PermissionFlagsBits.Connect) && overwrite.type === 1
            );

            const allowedOptions = allowedUsers
                .filter(x => x.id !== i.user.id)
                .map(user => ({
                    label: i.guild.members.cache.get(user.id)?.displayName || `Kullanıcı: ${user.id}`,
                    value: user.id
                }));

            const stringSelectMenu = new StringSelectMenuBuilder({
                customId: 'remove_permission',
                placeholder: 'Özel odaya izinli kullanıcılar',
                options: allowedOptions.slice(0, 25).length > 0 ? allowedOptions.slice(0, 25) : [{
                    label: 'Kimse mevcut değil',
                    value: 'none',
                    description: 'Odaya izinli kullanıcı yok.'
                }],
                disabled: allowedOptions.length === 0
            });

            const userSelectMenu = new UserSelectMenuBuilder({
                customId: 'add_permission',
                placeholder: 'Üye seç.',
                maxValues: 1
            });

            const stringSelectRow = new ActionRowBuilder().addComponents(stringSelectMenu);
            const userSelectRow = new ActionRowBuilder().addComponents(userSelectMenu);

            await i.reply({
                content: 'Aşağıdaki menüleri kullanarak kullanıcı izinlerini düzenleyin:',
                components: [stringSelectRow, userSelectRow],
                ephemeral: true
            });

            const collector = i.channel.createMessageComponentCollector({
                filter: i => i.user.id === i.user.id,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'remove_permission') {
                    const userId = i.values[0];
                    await channel.permissionOverwrites.edit(userId, {
                        [PermissionFlagsBits.Connect]: false
                    });
                    await i.update({
                        content: `<@${userId}> kullanıcısının özel oda izni kaldırıldı.`,
                        components: [],
                        ephemeral: true
                    });
                } else if (i.customId === 'add_permission') {
                    const userId = i.values[0];
                    await channel.permissionOverwrites.edit(userId, {
                        [PermissionFlagsBits.Connect]: true
                    });
                    await i.update({
                        content: `<@${userId}> kullanıcısına özel odaya bağlanma izni verildi.`,
                        components: [],
                        ephemeral: true
                    });
                }
            });
        }

        if (i.customId === 'claimOwnership') {
            if (!member.voice.channel) return i.update({
                embeds: [
                    new EmbedBuilder({
                        title: 'Kanal Bulunamadı!',
                        image: { url: 'https://tempvoice.xyz/embeds/discord/copyright-fail.png' },
                        description: `Geçerli bir ses kanalında değilsiniz. Lütfen bir ses kanalına katıldığınızdan emin olun:\n\n <#${document.secretRoomChannel}>`,
                    })
                ],
                components: [],
                ephemeral: true
            });

            await Settings.updateOne(
                {
                    id: member.guild.id,
                    'privateRooms.channel': channel.id
                },
                {
                    $set: { 'privateRooms.$.owner': member.id }
                }
            );

            i.update({ embeds: [], content: 'Oda artık size ait.', components: [], ephemeral: true });
        }
    }
})

function findEmoji(client, name) {
    return client.emojis.cache.find(emoji => emoji.name === name);
}

async function createTweetImage(username, avatarUrl, content, links, date, theme = 'light', tweetStats = null) {
    const formattedDate = new Intl.DateTimeFormat('tr-TR', {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);

    const tweetId = uuidv4().substring(0, 8);

    const themes = {
        light: {
            background: '#ffffff',
            text: '#0F1419',
            secondaryText: '#536471',
            border: '#e1e8ed',
            accent: '#1DA1F2',
            verified: '#1DA1F2'
        },
        dark: {
            background: '#15202B',
            text: '#FFFFFF',
            secondaryText: '#8899A6',
            border: '#38444d',
            accent: '#1DA1F2',
            verified: '#1DA1F2'
        },
        blue: {
            background: '#1DA1F2',
            text: '#FFFFFF',
            secondaryText: '#E8F5FE',
            border: '#1a91da',
            accent: '#FFFFFF',
            verified: '#FFFFFF'
        }
    };

    const commentCount = tweetStats ? (tweetStats.comments || tweetStats.commentData.length) : 0;
    const retweetCount = tweetStats ? tweetStats.retweets.length : 0;
    const likeCount = tweetStats ? tweetStats.likes.length : 0;
    const themeColors = themes[theme] || themes.light;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            
            body {
                font-family: 'Roboto', Arial, sans-serif;
                background-color: transparent;
                overflow: hidden;
            }
            
            .tweet-card {
                width: 650px;
                background-color: ${themeColors.background};
                border-radius: 16px;
                padding: 16px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
                border: 1px solid ${themeColors.border};
            }
            
            .tweet-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .tweet-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin-right: 12px;
                border: 2px solid ${themeColors.border};
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .tweet-user-info {
                flex: 1;
            }
            
            .tweet-username {
                font-weight: 700;
                font-size: 16px;
                color: ${themeColors.text};
                margin-bottom: 2px;
                display: flex;
                align-items: center;
            }
            
            .tweet-username-verified {
                width: 18px;
                height: 18px;
                margin-left: 4px;
                background-color: ${themeColors.verified};
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
            }
            
            .tweet-handle {
                color: ${themeColors.secondaryText};
                font-size: 14px;
            }
            
            .twitter-logo {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 28px;
                height: 28px;
                color: ${themeColors.accent};
                fill: ${themeColors.accent};
            }
            
            .tweet-content {
                font-size: 20px;
                line-height: 1.4;
                color: ${themeColors.text};
                margin-bottom: 16px;
                word-wrap: break-word;
                white-space: pre-wrap;
            }
            
            .tweet-links {
                font-size: 16px;
                color: ${themeColors.accent};
                margin-bottom: 16px;
                word-wrap: break-word;
            }
            
            .tweet-footer {
                display: flex;
                align-items: center;
                padding-top: 12px;
                border-top: 1px solid ${themeColors.border};
                color: ${themeColors.secondaryText};
                font-size: 14px;
            }
            
            .tweet-date {
                flex: 1;
            }
            
            .tweet-stats {
                display: flex;
                align-items: center;
            }
            
            .tweet-stat {
                margin-left: 24px;
                display: flex;
                align-items: center;
            }
            
            .tweet-stat-icon {
                margin-right: 6px;
                font-size: 16px;
            }
            
            .tweet-stat-count {
                font-weight: 500;
            }
            
            .hashtag, .mention {
                color: ${themeColors.accent};
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="tweet-card">
            <div class="tweet-header">
                <img class="tweet-avatar" src="${avatarUrl}" alt="${username}" />
                <div class="tweet-user-info">
                    <div class="tweet-username">
                        ${username}
                        <span class="tweet-username-verified">✓</span>
                    </div>
                <div class="tweet-handle">
  @${(username || '').toLowerCase().replace(/\s+/g, '_')}
</div>
                </div>
                <svg class="twitter-logo" viewBox="0 0 24 24" fill="${themeColors.accent}">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
                </svg>
            </div>
            
            <div class="tweet-content">${formatTweetContent(content, themeColors.accent)}</div>
            
            ${links ? `<div class="tweet-links">${formatLinks(links, themeColors.accent)}</div>` : ''}
            
            <div class="tweet-footer">
                <div class="tweet-date">${formattedDate} · Twitter Web App</div>
                <div class="tweet-stats">
                    <div class="tweet-stat">
                        <span class="tweet-stat-icon">💬</span>
                        <span class="tweet-stat-count">${commentCount}</span>
                    </div>
                    <div class="tweet-stat">
                        <span class="tweet-stat-icon">🔄</span>
                        <span class="tweet-stat-count">${retweetCount}</span>
                    </div>
                    <div class="tweet-stat">
                        <span class="tweet-stat-icon">❤️</span>
                        <span class="tweet-stat-count">${likeCount}</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const tempDir = os.tmpdir();
    const htmlPath = path.join(tempDir, `tweet-${tweetId}-${theme}.html`);
    const screenshotPath = path.join(tempDir, `tweet-${tweetId}-${theme}.png`);

    fs.writeFileSync(htmlPath, htmlTemplate);

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
            defaultViewport: {
                width: 650,
                height: 650
            }
        });

        const page = await browser.newPage();
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

        const height = await page.evaluate(() => {
            const tweetCard = document.querySelector('.tweet-card');
            return Math.ceil(tweetCard.offsetHeight) || 650;
        });

        const validHeight = Math.max(100, Math.min(4000, parseInt(height, 10) || 650));

        await page.setViewport({
            width: 650,
            height: validHeight
        });

        await page.screenshot({
            path: screenshotPath,
            omitBackground: true,
            clip: {
                x: 0,
                y: 0,
                width: 650,
                height: validHeight
            }
        });
    } catch (error) {
        console.error('Screenshot alınırken hata oluştu:', error);

        if (browser && error.message.includes('setDeviceMetricsOverride') && error.message.includes('height')) {
            try {
                const page = await browser.newPage();
                await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

                await page.setViewport({ width: 650, height: 800 });

                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true,
                    omitBackground: true
                });
            } catch (fallbackError) {
                console.error('Fallback screenshot alınırken hata oluştu:', fallbackError);
                throw new Error('Tweet görüntüsü oluşturulamadı: ' + fallbackError.message);
            }
        } else {
            throw new Error('Tweet görüntüsü oluşturulamadı: ' + error.message);
        }
    } finally {
        if (browser) {
            await browser.close();
        }

        try {
            fs.unlinkSync(htmlPath);
        } catch (err) {
            console.error('HTML dosyası temizlenirken hata oluştu:', err);
        }
    }

    return screenshotPath;
}



function formatTweetContent(content, accentColor = '#1DA1F2') {

    let formattedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    formattedContent = formattedContent
        .replace(/#(\w+)/g, `<span class="hashtag">#$1</span>`)
        .replace(/@(\w+)/g, `<span class="mention">@$1</span>`);

    return formattedContent;
}

function formatLinks(links, accentColor = '#1DA1F2') {

    let formattedLinks = links
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    formattedLinks = formattedLinks.replace(
        /(https?:\/\/[^\s]+)/g,
        `<a href="$1" style="color: ${accentColor}; text-decoration: none;">$1</a>`
    );

    formattedLinks = formattedLinks
        .replace(/#(\w+)/g, `<span class="hashtag">#$1</span>`)
        .replace(/@(\w+)/g, `<span class="mention">@$1</span>`);

    return formattedLinks;
}

async function handleLike(i, tweet) {
    const userIndex = tweet.likes.findIndex(like => like.userId === i.user.id);

    if (userIndex === -1) {
        tweet.likes.push({
            userId: i.user.id,
            username: i.user.username,
            likedAt: new Date()
        });
        await tweet.save();
        await i.reply({ content: 'Tweeti beğendiniz!', ephemeral: true });
    } else {
        tweet.likes.splice(userIndex, 1);
        await tweet.save();
        await i.reply({ content: 'Tweet beğeninizi kaldırdınız!', ephemeral: true });
    }

    await updateTweetImage(i, tweet);
}

async function handleRetweet(i, tweet) {
    const userIndex = tweet.retweets.findIndex(retweet => retweet.userId === i.user.id);

    if (userIndex === -1) {
        tweet.retweets.push({
            userId: i.user.id,
            username: i.user.username,
            retweetedAt: new Date()
        });
        await tweet.save();
        await i.reply({ content: 'Tweeti retweetlediniz!', ephemeral: true });
    } else {
        tweet.retweets.splice(userIndex, 1);
        await tweet.save();
        await i.reply({ content: 'Retweet işleminizi geri aldınız!', ephemeral: true });
    }

    await updateTweetImage(i, tweet);
}

async function openCommentModal(i, tweet) {
    const modal = new ModalBuilder()
        .setCustomId(`commentModal_${tweet.tweetId}`)
        .setTitle('Yorumunuzu Yazın');

    const commentInput = new TextInputBuilder()
        .setCustomId('commentContent')
        .setLabel('Yorumunuz')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Yorumunuzu girin...')
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(commentInput);
    modal.addComponents(row);

    await i.showModal(modal);
}

async function handleComment(i, tweetId) {
    const tweet = await Tweet.findOne({ tweetId });
    if (!tweet) {
        return i.reply({ content: 'Bu tweet bulunamadı.', ephemeral: true });
    }

    const comment = i.fields.getTextInputValue('commentContent');

    tweet.commentData.push({
        userId: i.user.id,
        username: i.user.username,
        comment: comment,
        commentedAt: new Date()
    });

    tweet.comments += 1;
    await tweet.save();

    await i.reply({ content: 'Yorumunuz eklendi!', ephemeral: true });
    await updateTweetImage(i, tweet);
}

async function showInteractions(i, tweet) {
    const likesCount = tweet.likes.length;
    const retweetsCount = tweet.retweets.length;
    const commentsCount = tweet.comments;
    const downloadsCount = tweet.dowlands;

    const embed = new EmbedBuilder()
        .setTitle(`Tweet #${tweet.tweetNo} Etkileşimleri`)
        .setColor('#1DA1F2')
        .addFields(
            { name: 'Beğeniler', value: `${likesCount} beğeni`, inline: true },
            { name: 'Retweetler', value: `${retweetsCount} retweet`, inline: true },
            { name: 'Yorumlar', value: `${commentsCount} yorum`, inline: true },
            { name: 'Oluşturulma Tarihi', value: `<t:${Math.floor(tweet.createdAt.getTime() / 1000)}:F>`, inline: false }
        );

    if (likesCount > 0) {
        const recentLikes = tweet.likes.slice(-5).map(like => `${like.username} (<t:${Math.floor(like.likedAt.getTime() / 1000)}:R>)`).join('\n');
        embed.addFields({ name: 'Son Beğenenler', value: recentLikes, inline: false });
    }

    if (commentsCount > 0) {
        const recentComments = tweet.commentData.slice(-3).map(comment =>
            `**${comment.username}:** ${comment.comment.substring(0, 50)}${comment.comment.length > 50 ? '...' : ''}`
        ).join('\n\n');
        embed.addFields({ name: 'Son Yorumlar', value: recentComments, inline: false });
    }

    await i.reply({ embeds: [embed], ephemeral: true });
}
async function updateTweetImage(i, tweet) {
  try {
    const channel  = i.channel;
    const messages = await channel.messages.fetch({ limit: 50 });
    const tweetMessage = messages.find(msg =>
      msg.components?.[0]?.components.some(c =>
        ['like_', 'retweet_', 'yorum_', 'interactions_']
          .some(prefix => c.customId === `${prefix}${tweet.tweetId}`)
      )
    );
    if (!tweetMessage) return;

    // Orijinal yazar verisi:
    const username  = tweet.authorUsername;      // kesin string
    const avatarURL = tweet.authorAvatarURL;     // kesin string

    // Diğer parametreler
    const theme     = (tweet.theme || 'light').toLowerCase();
    const createdAt = tweet.originalCreatedAt || tweet.createdAt;

    // Burada kesinlikle username ve avatarURL değişmeyecek:
    const tweetImage = await createTweetImage(
      username,
      avatarURL,
      tweet.content,
      '',        // footer
      createdAt,
      theme,
      tweet       // diğer opsiyonlar
    );

    const attachment = new AttachmentBuilder(tweetImage, {
      name: `tweet-${tweet.tweetId}.png`
    });
  const interactionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`yorum_${tweet.tweetId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Yorum Yap'),
            new ButtonBuilder()
                .setCustomId(`retweet_${tweet.tweetId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Retweet'),
            new ButtonBuilder()
                .setCustomId(`like_${tweet.tweetId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Beğen'),
            new ButtonBuilder()
                .setCustomId(`interactions_${tweet.tweetId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Etkileşimler'),
        );

        await tweetMessage.edit({
            files: [attachment],
            components: [interactionRow]
        });
  } catch (error) {
    console.error('Tweet görüntüsü güncellenirken hata oluştu:', error);
  }
}
