const { channelCreate, channelDelete, channelUpdate, channelOverwriteCreate, channelOverwriteDelete, channelOverwriteUpdate, emojiCreate, emojiDelete, emojiUpdate, roleCreate, roleDelete, roleUpdate, stickerCreate, stickerDelete, stickerUpdate, webhookCreate, webhookDelete, webhookUpdate, memberBan, memberUnban, memberKick, memberRoleUpdate, memberUpdate, guildUpdate, botAdd } = require('./Server Watcher');
const { Client, GatewayIntentBits, Partials, PermissionFlagsBits, TextInputBuilder, TextInputStyle, ModalBuilder, Events, AuditLogEvent, codeBlock, PermissionsBitField, EmbedBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ActionRowBuilder, ChannelType, PermissionOverwriteManager, PermissionOverwrites, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, RoleSelectMenuBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../../../System');
const Settings = require('../../Schema/GuardSettings');
const roleModel = require('../../Schema/RoleModel');
const channelModel = require('../../Schema/ChannelModel')
const { scheduleJob } = require('node-schedule');
const { expressionBackup, roleBackup, channelBackup, createRole, createChannel, createExpression } = require('../Utils/Functions');
require('colors');
const client = new Client({
	intents: Object.keys(GatewayIntentBits),
	partials: Object.keys(Partials),
	rest: { version: 10, hashLifetime: Infinity },
	presence: { status: config.Presence.Status, activities: [{ name: config.Presence.Message[Math.floor(Math.random() * config.Presence.Message.length)], type: config.Presence.Type, url: 'https://www.twitch.tv/arescuk' }] },
	ws: { version: 10, properties: { $browser: 'discord.js' } }
});

client.on(Events.ClientReady, async () => {
	const guild = client.guilds.cache.get(config.serverID);
	if (!guild) return;

	const channel = guild.channels.cache.get(config.channelID);
	if (!channel || channel.type !== ChannelType.GuildVoice) return;

	setInterval(async () => {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
    }, 20000);

	console.log(`[AUTO BACKUP] Yeni Sunucu Yedeği Alınıyor!`)
	await roleBackup(guild);
	await channelBackup(guild);
	await expressionBackup(guild);
});

client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot || !message.guild) return;

	if (!config.ownerID.includes(message.author.id)) return;
	if (message.content.startsWith(config.Security.Prefix)) {
		const args = message.content.slice(1).trim().split(/ +/g);
		const cmd = args.shift().toLowerCase();
		if (!cmd) return;

		if (cmd === 'güvenli') {
			if (!['ekle', 'çıkar', 'liste'].some(x => args[0] == x)) return message.reply({ content: `Lütfen geçerli bir işlem belirtin. \`ekle\`, \`çıkar\`, \`liste\`` })

			if (args[0] === 'ekle') {

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('addRole')
						.setLabel('Rol Ekle')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('addUser')
						.setLabel('Üye Ekle')
						.setStyle(ButtonStyle.Primary)
				);

				const msg = await message.channel.send({
					content: `Whitelist'e ne eklemek istiyorsunuz?`,
					components: [row]
				});

				const collector = msg.createMessageComponentCollector({
					filter: i => i.user.id === message.author.id, time: 45000
				});

				collector.on('collect', async i => {
					if (i.customId === 'addRole' || i.customId === 'addUser') {
						i.deferUpdate();

						const row = i.customId === 'addRole'
							? new RoleSelectMenuBuilder().setCustomId('whitelistRole').setPlaceholder('Rol Seç').setMaxValues(1)
							: new UserSelectMenuBuilder().setCustomId('whitelistUser').setPlaceholder('Kullanıcı Seç').setMaxValues(1);

						const selectionRow = new ActionRowBuilder().addComponents(row);

						await msg.edit({
							content: `Lütfen whitelist eklemek istediğiniz ${i.customId === 'addRole' ? 'rolü' : 'kullanıcıyı'} seçiniz.`,
							components: [selectionRow]
						});

						const selectionCollector = msg.createMessageComponentCollector({
							filter: i => i.user.id === message.author.id, time: 45000
						});

						selectionCollector.on('collect', async i => {
							if (i.customId === 'whitelistRole' || i.customId === 'whitelistUser') {
								i.deferUpdate();
								const value = i.values[0];

								const typeRow = new ActionRowBuilder().addComponents(
									new StringSelectMenuBuilder()
										.setCustomId('whitelistType')
										.setPlaceholder('Whitelist Türü Seç')
										.addOptions([
											{ label: 'Full (Riskli)', value: 'full' },
											{ label: 'Sunucu Güncellemeleri', value: 'guildUpdate' },
											{ label: 'Üye Güncellemeler (Ban, Kick, Rol)', value: 'memberUpdate' },
											{ label: 'Kanal', value: 'channel' },
											{ label: 'Rol', value: 'role' },
											{ label: 'Emoji/Sticker', value: 'emoji' },
										])
								);

								await msg.edit({
									content: `Lütfen whitelist türünü seçiniz.`,
									components: [typeRow]
								});

								const typeCollector = msg.createMessageComponentCollector({
									filter: i => i.user.id === message.author.id, time: 45000
								});

								typeCollector.on('collect', async i => {
									if (i.customId === 'whitelistType') {
										i.deferUpdate();
										const type = i.values[0];

										const limitRow = new ActionRowBuilder().addComponents(
											new StringSelectMenuBuilder()
												.setCustomId('limitSelect')
												.setPlaceholder('Limit Seç')
												.addOptions([
													{ label: '5', value: '5' },
													{ label: '10', value: '10' },
													{ label: '15', value: '15' },
													{ label: '20', value: '20' },
													{ label: '25', value: '25' },
													{ label: '50', value: '50' },
													{ label: '100', value: '100' },
													{ label: '200', value: '200' },
													{ label: '500', value: '500' },
													{ label: '1000', value: '1000' },
												])
										);

										await msg.edit({
											content: `Lütfen whitelist limiti seçiniz.`,
											components: [limitRow]
										});

										const limitCollector = msg.createMessageComponentCollector({
											filter: i => i.user.id === message.author.id, time: 45000
										});

										limitCollector.on('collect', async i => {
											if (i.customId === 'limitSelect') {
												i.deferUpdate();
												const limit = i.values[0];

												const punishRow = new ActionRowBuilder().addComponents(
													new StringSelectMenuBuilder()
														.setCustomId('punishSelect')
														.setPlaceholder('Ceza Seç')
														.addOptions([
															{ label: 'Ban', value: 'ban' },
															{ label: 'Kick', value: 'kick' },
															{ label: 'Y.Çek', value: 'pull' },
														])
												);

												await msg.edit({
													content: `Lütfen ceza tipini seçiniz.`,
													components: [punishRow]
												});

												const punishCollector = msg.createMessageComponentCollector({
													filter: i => i.user.id === message.author.id, time: 45000
												});

												punishCollector.on('collect', async i => {
													if (i.customId === 'punishSelect') {
														i.deferUpdate();
														const punish = i.values[0];

														const document = await Settings.findOne({ guildID: message.guild.id })
														if (!document || !document.whitelist) {
															await Settings.create({ guildID: message.guild.id, whitelist: [{ key: value, access: [{ type, limit, punish }] }] });
															await msg.edit({ content: `Whitelist başarıyla eklendi!`, components: [] });
															return;
														}

														const findOld = document.whitelist.find((x) => x.key === value);
														if (findOld) {
															const sameType = findOld.access.find((x) => x.type === type);
															if (sameType) {
																sameType.limit = limit;
																sameType.punish = punish;
																await Settings.updateOne({ guildID: message.guild.id }, { $set: { whitelist: document.whitelist } });
																await msg.edit({ content: `Whitelist başarıyla güncellendi!`, components: [] });
																return;
															};

															findOld.access.push({ type, limit, punish });
															await Settings.updateOne({ guildID: message.guild.id }, { $set: { whitelist: document.whitelist } });
															await msg.edit({ content: `Whitelist başarıyla güncellendi!`, components: [] });
															return;
														}

														document.whitelist.push({ key: value, access: [{ type, limit, punish }] });
														await Settings.updateOne({ guildID: message.guild.id }, { $set: { whitelist: document.whitelist } });

														await msg.edit({ content: `Whitelist başarıyla eklendi!`, components: [] });
													}
												});
											}
										})
									}
								})
							}
						});
					}
				});
			} else if (args[0] === 'çıkar') {

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('removeRole')
						.setLabel('Rol Çıkar')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('removeUser')
						.setLabel('Üye Çıkar')
						.setStyle(ButtonStyle.Primary)
				);

				const msg = await message.channel.send({
					content: `Whitelist'den ne çıkarmak istiyorsunuz?`,
					components: [row]
				});

				const collector = msg.createMessageComponentCollector({
					filter: i => i.user.id === message.author.id, time: 45000
				});

				collector.on('collect', async i => {
					if (i.customId === 'removeRole' || i.customId === 'removeUser') {
						i.deferUpdate();

						const row = i.customId === 'removeRole'
							? new RoleSelectMenuBuilder().setCustomId('whitelistRole').setPlaceholder('Rol Seç').setMaxValues(1)
							: new UserSelectMenuBuilder().setCustomId('whitelistUser').setPlaceholder('Kullanıcı Seç').setMaxValues(1);

						const selectionRow = new ActionRowBuilder().addComponents(row);

						await msg.edit({
							content: `Lütfen whitelist çıkarmak istediğiniz ${i.customId === 'removeRole' ? 'rolü' : 'kullanıcıyı'} seçiniz.`,
							components: [selectionRow]
						});

						const selectionCollector = msg.createMessageComponentCollector({
							filter: i => i.user.id === message.author.id, time: 45000
						});

						selectionCollector.on('collect', async i => {
							if (i.customId === 'whitelistRole' || i.customId === 'whitelistUser') {
								i.deferUpdate();
								const value = i.values[0];

								const document = await Settings.findOne({ guildID: message.guild.id })
								if (!document || !document.whitelist) return;

								const findOld = document.whitelist.find((x) => x.key === value);
								if (!findOld) return await msg.edit({ content: `Whitelist bulunamadı!`, components: [] });

								document.whitelist = document.whitelist.filter((x) => x.key !== value);
								await Settings.updateOne({ guildID: message.guild.id }, { $set: { whitelist: document.whitelist } });

								await msg.edit({ content: `Whitelist başarıyla çıkarıldı!`, components: [] });
							}
						});
					}
				})
			} else if (args[0] === 'liste') {

				const document = await Settings.findOne({ guildID: message.guild.id })
				if (!document || !document.whitelist) return;

				const whitelistData = document.whitelist.map((x) => {
					const roleOrUserName = message.guild?.roles.cache.has(x.key)
						? message.guild?.roles.cache.get(x.key)?.name
						: message.guild?.members.cache.get(x.key)?.user?.username;

					const name = roleOrUserName || 'Bulunamadı';

					const roleOrUserType = message.guild?.roles.cache.has(x.key) ? '(Rol)' : '(Kullanıcı)';

					const accessContent = x.access.map((y) => {
						const limit = y.limit || 'Limit yok';
						const type = y.type || 'Bilinmiyor'
						const punish = y.punish || 'Bilinmiyor';
						return [
							`→ Tip: ${type === 'full' ? 'Full Erişim' : type === 'guildUpdate' ? 'Sunucu Güncellemeleri' : type === 'memberUpdate' ? 'Üye Güncellemeleri' : type === 'channel' ? 'Kanal' : type === 'role' ? 'Rol' : 'Emoji/Sticker'}`,
							`→ Limit: ${limit}`,
							`→ Ceza: ${punish === 'pull' ? 'Y.Çek' : punish === 'ban' ? 'Ban' : 'Kick'}`
						].join('\n');
					}).join('\n\n');

					return accessContent
						? codeBlock('yaml', [`# ${name} ${roleOrUserType}`, accessContent].join('\n'))
						: null;
				}).filter(Boolean);

				if (whitelistData.length === 0) {
					return await message.reply({ content: 'Whitelist bulunamadı.' });
				}

				let page = 1;
				const totalData = Math.ceil(whitelistData.length / 5);

				const question = await message.channel.send({
					embeds: [new EmbedBuilder({ description: whitelistData.slice(0, 5).join('\n') })],
					components: totalData > 1 ? [getButton(page, totalData)] : []
				})

				const collector = question.createMessageComponentCollector({
					filter: i => i.user.id === message.author.id, time: 60000
				});

				collector.on('collect', async i => {
					if (i.customId === 'first') page = 1;
					if (i.customId === 'previous') page -= 1;
					if (i.customId === 'next') page += 1;
					if (i.customId === 'last') page = totalData;

					await i.deferUpdate();
					await question.edit({
						embeds: [new EmbedBuilder({ description: whitelistData.slice((page - 1) * 5, page * 5).join('\n') })],
						components: [getButton(page, totalData)]
					});
				});
			}
		}

		if (cmd === 'denetim') {

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('roleControl')
						.setLabel('Rol Denetim')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('channelControl')
						.setLabel('Kanal Denetim')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('emojiControl')
						.setLabel('Emoji/Sticker Denetim')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('banControl')
						.setLabel('Ban Denetim')
						.setStyle(ButtonStyle.Secondary),
				)

			const question = await message.channel.send({
				components: [row]
			}).catch(err => { });

			const collector = question.createMessageComponentCollector({
				filter: i => i.user.id === message.author.id, time: 60000
			});

			collector.on('collect', async i => {
				i.deferUpdate();
				if (i.customId === 'roleControl') {
					let arr = [];
					const roleAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
					roleAudit.forEach((x) => {
						if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
							arr.push({
								label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
								value: `role-${x.targetId}`,
								description: `${x.targetId} ID'li Rol`
							})
						}
					})

					if (arr.length > 0) {
						const newQuestion = await question.channel.send({
							embeds: [
								new EmbedBuilder({
									footer: { text: `Son 24 Saat İçinde Silinmiş Roller`, iconURL: message.guild.iconURL({ dynamic: true }) },
									description: `${roleAudit.map((x) => `\`${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>`).join('\n')}`
								})
							],
							components: [
								new ActionRowBuilder({
									components: [
										new ButtonBuilder({
											customId: 'roleCreate',
											label: 'Rol Kur',
											style: ButtonStyle.Secondary
										})
									]
								})
							]
						}).catch(err => { })

						const roleCollector = newQuestion.createMessageComponentCollector({
							filter: i => i.user.id === message.author.id, time: 60000
						});

						roleCollector.on('collect', async i => {
							if (i.customId === 'roleCreate') {
								const idInputRow = new ActionRowBuilder({
									components: [
										new TextInputBuilder({
											custom_id: 'id',
											label: 'Rol ID',
											placeholder: '123456789123456789',
											style: TextInputStyle.Short,
											required: true
										})
									]
								});

								await i.showModal(
									new ModalBuilder({
										custom_id: 'modal',
										title: 'Silinen Rolü Kur',
										components: [idInputRow]
									})
								);

								const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
								if (modalCollected) {
									const roleId = modalCollected.fields.getTextInputValue('id')
									const document = await roleModel.findOne({ role: roleId });
									if (!document) return await modalCollected.reply({ content: 'Rol veritabanında bulunamadı!', components: [], ephemeral: true }).catch(err => { });
									await createRole(client, document);
									await modalCollected.reply({ content: 'Rol başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
								}
							}
						});
					} else {
						question.edit({ content: `Silinmiş Rol Bulunamadı.`, embeds: [], components: [] }).catch(err => { });
					}
				} else if (i.customId === 'channelControl') {
					let arr = [];
					const channelAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
					channelAudit.forEach((x) => {
						if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
							arr.push({
								label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
								value: `channel-${x.targetId}`,
								description: `${x.targetId} ID'li Kanal`
							})
						}
					})

					if (arr.length > 0) {
						const newQuestion = await question.channel.send({
							embeds: [
								new EmbedBuilder({
									footer: { text: `Son 24 Saat İçinde Silinmiş Kanallar`, iconURL: message.guild.iconURL({ dynamic: true }) },
									description: `${channelAudit.map((x) => `\`${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>`).join('\n')}`
								})
							],
							components: [
								new ActionRowBuilder({
									components: [
										new ButtonBuilder({
											customId: 'channelCreate',
											label: 'Kanal Kur',
											style: ButtonStyle.Secondary
										})
									]
								})
							]
						}).catch(err => { });

						const channelCollector = newQuestion.createMessageComponentCollector({
							filter: i => i.user.id === message.author.id, time: 60000
						});

						channelCollector.on('collect', async i => {
							if (i.customId === 'channelCreate') {
								const idInputRow = new ActionRowBuilder({
									components: [
										new TextInputBuilder({
											custom_id: 'id',
											label: 'Kanal ID',
											placeholder: '123456789123456789',
											style: TextInputStyle.Short,
											required: true
										})
									]
								});

								await i.showModal(
									new ModalBuilder({
										custom_id: 'modal',
										title: 'Silinen Kanalı Kur',
										components: [idInputRow]
									})
								);

								const modalCollected = await i.awaitModalSubmit({
									filter: (i) => i.user.id === message.author.id,
									time: 1000 * 60 * 5,
								});

								if (modalCollected) {
									const channelId = modalCollected.fields.getTextInputValue('id')
									const document = await channelModel.findOne({ channel: channelId });
									if (!document) return await modalCollected.reply({ content: 'Kanal veritabanında bulunamadı!', components: [], ephemeral: true }).catch(err => { });
									await createChannel(client, document);
									await modalCollected.reply({ content: 'Kanal başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
								}

							}
						});

					} else {
						question.reply({ content: `Silinmiş Kanal Bulunamadı.`, embeds: [], components: [] }).catch(err => { });
					}
				} else if (i.customId === 'emojiControl') {
					const arr = [];
					const emojiAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
					emojiAudit.forEach((x) => {
						if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
							arr.push({
								label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
								time: x.createdTimestamp,
								value: `emoji-${x.targetId}`,
								description: `${x.targetId} ID'li Emoji`,
								type: 'emoji',
							});
						}
					});

					const stickerAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.StickerDelete })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
					stickerAudit.forEach((x) => {
						if (x.changes.filter((y) => y.key == 'name').map((z) => z?.old)) {
							arr.push({
								label: `${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,
								time: x.createdTimestamp,
								value: `sticker-${x.targetId}`,
								description: `${x.targetId} ID'li Sticker`,
								type: 'emoji',
							});
						}
					});

					if (arr.length > 0) {
						arr.sort((a, b) => b.time - a.time);
						const newQuestion = await question.channel.send({
							embeds: [
								new EmbedBuilder({
									footer: { text: `Son 24 Saat İçinde Silinmiş Emoji/Sticker`, iconURL: message.guild.iconURL({ dynamic: true }) },
									description: `${arr.map((x) => `\`${x.label} (${x.description})\` <t:${Math.floor(x.time / 1000)}>`).join('\n')}`
								})
							],
							components: [
								new ActionRowBuilder({
									components: [
										new ButtonBuilder({
											customId: 'emojiCreate',
											label: 'Emoji Kur',
											style: ButtonStyle.Secondary
										}),

										new ButtonBuilder({
											customId: 'stickerCreate',
											label: 'Sticker Kur',
											style: ButtonStyle.Secondary
										})
									]
								})
							]
						}).catch(err => { });

						const expressionCollector = newQuestion.createMessageComponentCollector({
							filter: i => i.user.id === message.author.id, time: 60000
						});

						expressionCollector.on('collect', async i => {
							if (i.customId === 'emojiCreate') {

								const idInputRow = new ActionRowBuilder({
									components: [
										new TextInputBuilder({
											custom_id: 'id',
											label: 'Emoji ID',
											placeholder: '123456789123456789',
											style: TextInputStyle.Short,
											required: true
										})
									]
								});

								await i.showModal(
									new ModalBuilder({
										custom_id: 'modal',
										title: 'Silinen Emojiyi Kur',
										components: [idInputRow]
									})
								);

								const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
								if (modalCollected) {
									const emojiId = modalCollected.fields.getTextInputValue('id')
									await createExpression(client, emojiId, 'emoji');
									await modalCollected.reply({ content: 'Emoji başarıyla oluşturuldu!', components: [], ephemeral: true }).catch(err => { });
								}
							} else if (i.customId === 'stickerCreate') {
								const idInputRow = new ActionRowBuilder({
									components: [
										new TextInputBuilder({
											custom_id: 'id',
											label: 'Sticker ID',
											placeholder: '123456789123456789',
											style: TextInputStyle.Short,
											required: true
										})
									]
								});

								await i.showModal(
									new ModalBuilder({
										custom_id: 'modal',
										title: 'Silinen Stickerı Kur',
										components: [idInputRow]
									})
								);

								const modalCollected = await i.awaitModalSubmit({ time: 1000 * 60 });
								if (modalCollected) {
									const stickerId = modalCollected.fields.getTextInputValue('id')
									await createExpression(client, stickerId, 'sticker');
									await i.editReply({ content: 'Sticker başarıyla oluşturuldu!', components: [] }).catch(err => { });
								}
							}
						})
					} else {
						question.edit({ content: `Son 24 saat içinde silinmiş **emoji/sticker** bulunamadı.`, embeds: [], components: [] }).catch(err => { });
					}
				} else if (i.customId === 'banControl') {
					const arr = [];
					const banAudit = (await message.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
					banAudit.forEach((x) => {
						arr.push({
							label: `${x.target.username}`,
							time: x.createdTimestamp,
							value: `ban-${x.targetId}`,
							description: `${x.targetId} ID'li Üye`,
						});
					});

					if (arr.length > 0) {
						arr.sort((a, b) => b.time - a.time);
						question.edit({
							embeds: [
								new EmbedBuilder({
									footer: { text: `Son 24 Saat İçinde Banlanmış Üyeler`, iconURL: message.guild.iconURL({ dynamic: true }) },
									description: `${arr.map((x) => `\`${x.label} (${x.description})\` <t:${Math.floor(x.time / 1000)}>`).join('\n')}`
								})
							],
							components: []
						}).catch(err => { });
					} else {
						question.edit({ content: `Son 24 saat içinde banlanmış üye bulunamadı.`, embeds: [], components: [] }).catch(err => { });
					}
				}
			})
		}

		if (cmd === 'ayarlar') {

			const row = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder({
						custom_id: 'settings',
						placeholder: 'Bir Ayar Seçin',
						options: [
							{
								label: 'Kanal Backup',
								value: 'channel_backup',
								emoji: '🔄',
							},
							{
								label: 'Rol Backup',
								value: 'role_backup',
								emoji: '🔄',
							},
							{
								label: 'Blacklist Rolleri',
								value: 'blacklist_roles',
								emoji: '🛡️',
							},
							{
								label: 'Blacklist Kanalları',
								value: 'blacklist_channels',
								emoji: '🛡️'
							},
							{
								label: 'Yetki İşlemleri',
								value: 'authority_operations',
								emoji: '⚙️',
							},
						]
					})
				)

			const question = await message.channel.send({
				components: [row]
			}).catch(err => { });

			const collector = question.createMessageComponentCollector({
				filter: i => i.user.id === message.author.id, time: 60000
			});

			collector.on('collect', async i => {
				i.deferUpdate();

				if (i.values[0] === 'channel_backup') {
					await channelBackup(message.guild);
					question.reply({ content: 'Kanal Yedeği Başarıyla Alındı!', components: [] }).catch(err => { });
				} else if (i.values[0] === 'role_backup') {
					await roleBackup(message.guild);
					question.reply({ content: 'Rol Yedeği Başarıyla Alındı!', components: [] }).catch(err => { });
				} else if (i.values[0] === 'blacklist_channels') {

					const data = await Settings.findOne({ guildID: message.guild.id })

					const blackListChannels = data?.blackListedChannels.map((x) => x.id) || [];

					const stringSelectMenu = new StringSelectMenuBuilder({
						custom_id: 'remove_channel',
						placeholder: 'Kanal seç..',
						options: blackListChannels.length > 0 ? blackListChannels.slice(0, 25).map((x) => {
							return {
								label: message.guild.channels.cache.get(x)?.name || '#deleted-channel',
								description: 'Kaldırmak için tıklayın.',
								value: x,
							}
						}) : [{ label: 'Kanal Bulunamadı.', value: 'null' }],
						disabled: blackListChannels.length === 0
					});

					const channelSelectMenu = new ChannelSelectMenuBuilder({
						customId: 'add_channel',
						placeholder: 'Kanal ara..',
						min_values: 1,
						max_values: 25
					});

					const stringRow = new ActionRowBuilder().addComponents(stringSelectMenu);
					const channelRow = new ActionRowBuilder().addComponents(channelSelectMenu);

					const msg = await question.reply({
						content: 'Kara Listeye Alınacak Kanalları Seçin',
						components: [stringRow, channelRow]
					}).catch(err => { })

					const collector = msg.createMessageComponentCollector({
						filter: i => i.user.id === message.author.id, time: 60000
					});

					collector.on('collect', async i => {
						i.deferUpdate();
						if (i.customId === 'remove_channel') {
							const filterData = blackListChannels.filter((x) => x !== i.values[0]);
							await Settings.updateOne({ guildID: message.guild.id }, { $set: { blackListedChannels: filterData.map((x) => { return { id: x } }) } }, { $upsert: true });
							await msg.edit({ content: 'Kanal Kara Listeden Kaldırıldı!', components: [] }).catch(err => { });
						} else if (i.customId === 'add_channel') {
							const value = i.values;
							await Settings.updateOne({ guildID: message.guild.id }, { $push: { blackListedChannels: value.map((x) => { return { id: x } }) } }, { $upsert: true });
							await msg.edit({ content: 'Kanal Kara Listeye Eklendi!', components: [] }).catch(err => { });
						}
					});
				} else if (i.values[0] === 'blacklist_roles') {
					const data = await Settings.findOne({ guildID: message.guild.id })

					const blackListRoles = data?.blackListedRoles?.map((x) => x.id) || [];

					const stringSelectMenu = new StringSelectMenuBuilder({
						custom_id: 'remove_role',
						placeholder: 'Rol seç..',
						options: blackListRoles.length > 0 ? blackListRoles.slice(0, 25).map((x) => {
							return {
								label: message.guild.roles.cache.get(x).name,
								description: 'Kaldırmak için tıklayın.',
								value: x,
							}
						}) : [{ label: 'Rol Bulunamadı.', value: 'null' }],
						disabled: blackListRoles.length === 0
					});

					const roleSelectMenu = new RoleSelectMenuBuilder({
						customId: 'add_role',
						placeholder: 'Rol ara..',
						minValues: 1,
						maxValues: 25
					});

					const stringRow = new ActionRowBuilder().addComponents(stringSelectMenu);
					const roleRow = new ActionRowBuilder().addComponents(roleSelectMenu);

					const msg = await question.reply({
						content: 'Kara Listeye Alınacak Rolleri Seçin',
						components: [stringRow, roleRow]
					}).catch(err => { })

					const collector = msg.createMessageComponentCollector({
						filter: i => i.user.id === message.author.id, time: 60000
					});

					collector.on('collect', async i => {
						i.deferUpdate();
						if (i.customId === 'remove_role') {
							const filterData = blackListRoles.filter((x) => x !== i.values[0]);
							await Settings.updateOne({ guildID: message.guild.id }, { $set: { blackListedRoles: filterData.map((x) => { return { id: x } }) } }, { $upsert: true });
							await msg.edit({ content: 'Rol Kara Listeden Kaldırıldı!', components: [] }).catch(err => { });
						} else if (i.customId === 'add_role') {
							const value = i.values;
							await Settings.updateOne({ guildID: message.guild.id }, { $push: { blackListedRoles: value.map((x) => { return { id: x } }) } }, { $upsert: true });
							await msg.edit({ content: 'Rol Kara Listeye Eklendi!', components: [] }).catch(err => { });
						}
					});
				} else if (i.values[0] === 'authority_operations') {

					const data = await Settings.findOne({ guildID: message.guild.id });
					if (!data || !data.rolePermissions) return question.reply({ content: 'Yetki İşlemleri ayarları bulunamadı.', components: [] });

					const msg = await question.reply({
						content: 'Sunucuda bulunan rollerde ki yetkileri açmak veya kapatmak için aşağıda ki butonları kullanınız.',
						components: [
							new ActionRowBuilder({
								components: [
									new ButtonBuilder({
										custom_id: 'open',
										label: 'Yetkileri Aç',
										style: ButtonStyle.Danger,
										disabled: data.rolePermissions.length === 0 ? true : false
									}),

									new ButtonBuilder({
										custom_id: 'close',
										label: 'Yetkileri Kapat',
										style: ButtonStyle.Danger,
										disabled: data.rolePermissions.length === 0 ? false : true
									})
								]
							})
						]
					}).catch(err => { });

					const collector = msg.createMessageComponentCollector({
						filter: i => i.user.id === message.author.id, time: 60000
					});

					collector.on('collect', async i => {
						i.deferUpdate();
						if (i.customId === 'open') {
							data?.rolePermissions?.forEach(p => {
								const role = message.guild.roles.cache.get(p.role);
								if (!role) return;
								if (!role.editable) return;
								role.setPermissions(new PermissionsBitField(p.permissions));
							});

							await Settings.updateOne({ guildID: message.guild.id }, { $set: { rolePermissions: [] } }, { $upsert: true });
							await msg.edit({ content: 'Yetkiler başarıyla açıldı.', components: [] }).catch(err => { });
						} else if (i.customId === 'close') {
							let perms = [PermissionFlagsBits.Administrator, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageWebhooks, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageGuild, PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers];
							const dangerRoles = message.guild.roles.cache.filter((r) => perms.some((perm) => r.permissions.has(perm)) && r.editable);
							const data = [];
	
							for (const r of dangerRoles.values()) {
								data.push({
									role: r.id,
									permissions: new PermissionsBitField(r.permissions.bitfield),
								})
						
								await r.setPermissions(PermissionsBitField.Flags.SendMessages).catch(() => { });
								await Settings.updateOne(
									{ guildID: message.guild.id },
									{ $push: { rolePermissions: data } },
									{ $upsert: true }
								);
							}

							await msg.edit({ content: 'Yetkiler başarıyla kapatıldı.', components: [] }).catch(err => { });
						}
					});
				}
			})
		}
	}
});

client.on(Events.GuildAuditLogEntryCreate, async (audit, guild) => {
	const type = audit.action;
	const changes = audit.changes;
	const member = guild.members.cache.get(audit?.executorId);

	if (type === AuditLogEvent.ChannelCreate) await channelCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelDelete) await channelDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelUpdate) await channelUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteCreate) await channelOverwriteCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteDelete) await channelOverwriteDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.ChannelOverwriteUpdate) await channelOverwriteUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiCreate) await emojiCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiDelete) await emojiDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.EmojiUpdate) await emojiUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleCreate) await roleCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleDelete) await roleDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.RoleUpdate) await roleUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerCreate) await stickerCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerDelete) await stickerDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.StickerUpdate) await stickerUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookCreate) await webhookCreate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookDelete) await webhookDelete(client, guild, audit, member, changes);
	if (type === AuditLogEvent.WebhookUpdate) await webhookUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberBanAdd) await memberBan(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberBanRemove) await memberUnban(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberKick) await memberKick(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberRoleUpdate) await memberRoleUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.MemberUpdate) await memberUpdate(client, guild, audit, member, changes);
	if (type === AuditLogEvent.BotAdd) await botAdd(client, guild, audit, member, changes);
	if (type === AuditLogEvent.GuildUpdate) await guildUpdate(client, guild, audit, member, changes);
});

client.login(config.Security.Logger).then(() => { console.log(`[BOT] ${client.user.tag} olarak giriş yaptı!`) }).catch((err) => { console.log(`[Logger] Başlatılamadı! Hata: ${err}`) })

scheduleJob('0 0 */2 * * *', async function () {
	const guild = client.guilds.cache.get(config.serverID);
	if (!guild) return;
	console.log(`[AUTO BACKUP] Yeni Sunucu Yedeği Alınıyor!`)
	await roleBackup(guild);
	await channelBackup(guild);
	await expressionBackup(guild);
})

function getButton(page, total) {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('first')
				.setEmoji('⏮️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId('previous')
				.setEmoji('⬅️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId('count')
				.setLabel(`${page}/${total}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('next')
				.setEmoji('➡️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(total === page),
			new ButtonBuilder()
				.setCustomId('last')
				.setEmoji('⏭️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === total),
		);
}