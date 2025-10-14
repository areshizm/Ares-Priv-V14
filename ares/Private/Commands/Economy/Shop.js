const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, codeBlock, bold } = require('discord.js');
const UserModel = require('../../../Schema/User')
const { table, getBorderCharacters } = require('table')

module.exports = {
    name: 'shop',
    aliases: ['market'],
    category: 'Economy',

    execute: async (client, message, args, ares) => {
        const channel = message.guild.channels.cache.get(ares.coinChannel);
        if (message.channel.name !== channel?.name) return message.reply({ content: `Bu komut sadece ${channel} kanalında kullanılabilir.` });

        const document = (await UserModel.findOne({ id: message.author.id })) || new UserModel({ id: message.author.id }).save();

        const cash = document.inventory.cash || 0;

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'ring1',
                    label: 'Pırlanta Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204669831614475',
                    disabled: cash < 50000,
                }),
                new ButtonBuilder({
                    customId: 'ring2',
                    label: 'Baget Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204617058889849',
                    disabled: cash < 150000,
                }),
                new ButtonBuilder({
                    customId: 'ring3',
                    label: 'Tektaş Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204523047755873',
                    disabled: cash < 250000,
                }),
            ]
        })

        const row2 = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'ring4',
                    label: 'Tria Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204472682561586',
                    disabled: cash < 500000,
                }),
                new ButtonBuilder({
                    customId: 'ring5',
                    label: 'Beştaş Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204227110240347',
                    disabled: cash < 1000000,
                }),
                new ButtonBuilder({
                    customId: 'cancel',
                    label: 'İşlemi İptal Et',
                    style: ButtonStyle.Danger,
                    emoji: '❎',
                }),
            ]
        })

        const shopData = [
            { id: '1', name: 'ring1', price: 50000, description: 'Pırlanta Yüzük', amount: 1 },
            { id: '2', name: 'ring2', price: 150000, description: 'Baget Yüzük', amount: 1 },
            { id: '3', name: 'ring3', price: 250000, description: 'Tektaş Yüzük', amount: 1 },
            { id: '4', name: 'ring4', price: 500000, description: 'Tria Yüzük', amount: 1 },
            { id: '5', name: 'ring5', price: 1000000, description: 'Beştaş Yüzük', amount: 1 },
        ]

        let text = [['ID', 'Ürün İsmi', 'Ürün Detayı', 'Ürün Fiyatı']]
        text = text.concat(
            shopData.map((value) => {
                return [`#${value.id}`, `${value.description}`, `${value.amount} Adet`, `${value.price} 💵`]
            })
        )

        const config = {
            border: getBorderCharacters(`void`),
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1
            },
            columns: {
                0: {
                    paddingLeft: 1
                },
                1: {
                    paddingLeft: 1
                },
                2: {
                    paddingLeft: 1,
                    alignment: 'center'
                },
                3: {
                    paddingLeft: 1,
                    paddingRight: 1
                }
            },

            drawHorizontalLine: (index, size) => {
                return index === 0 || index === 1 || index === size
            }
        }

        const embed = new EmbedBuilder({
            footer: { text: 'ares was here ❤️', iconURL: message.guild.iconURL({ dynamic: true, size: 2048 }) },
            fields: [
                {
                    name: `Mağaza (\`Bakiye: ${cash ? Math.floor(parseInt(cash)) : 0} 💵\`)`,
                    value: `\`\`\`${table(text, config)}\`\`\``
                },
                {
                    name: `Ürün nasıl satın alabilirim?`,
                    value: `Aşağıda beliren butonlardan yeşil olanlara \`30 Saniye\` içerisinde tıklayarak satın alabilirsin.`
                }
            ]

        })
        
        const question = await message.channel.send({
            embeds: [embed],
            components: [row, row2]
        })

        const filter = (i) => i.user.id === message.author.id
        const collector = question.createMessageComponentCollector({ filter, time: 30000 })

        collector.on('collect', async (i) => {
            if (i.customId === 'cancel') {
                i.deferUpdate()
                return collector.stop()
            }

            const item = shopData.find((item) => item.name === i.customId)
            if (!item) {
                i.deferUpdate()
                return collector.stop()
            }

            if (cash < item.price) {
                i.deferUpdate()
                return collector.stop()
            }

            document.inventory.cash = cash - item.price
            document.inventory[item.name] = (document.inventory[item.name] || 0) + item.amount
            document.markModified('inventory')
            await document.save()

            i.reply({
                content: `Başarıyla **${item.description}** ürününü satın aldınız!`,
                ephemeral: true
            })

            return collector.stop()
        })

        collector.on('end', async (collected, reason) => {
            question.delete().catch(() => { })
        })
    }
}