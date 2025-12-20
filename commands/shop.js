const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'silv_token', name: 'Silv token', price: 10000, emoji: '<:SILV_TOKEN:1447678878448484555>', description: 'A shiny coin for exchanging robux and more!' },
  { id: 'common', name: 'Common key', price: 100, emoji: '🔑', description: 'A humble key blessed with a small fortune.' },
  { id: 'rare', name: 'Rare key', price: 500, emoji: '🗝', description: 'A radiant key imbued with wealth and fortune.' },
  { id: 'legendary', name: 'Legendary key', price: 900, emoji: '🔑', description: 'A divine key said to give wealth far beyond imagination' },
];

module.exports = {
  name: 'shop',
  description: 'View the shop and available items to buy',
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setTitle('˗ˏˋ 𐙚 🛒 𝔥𝔢𝔞𝔳𝔢𝔫𝔩𝔶 𝔢𝔪𝔭𝔬𝔯𝔦𝔲𝔪 𐙚 ˎˊ˗')
      .setDescription(
        [
          'Use `.buy <item_id> [quantity]` to exchange your coins for celestial goods.',
          '',
          '────────────────────────────────────────',
        ].join('\n')
      )
      .setColor('#F5E6FF')
      .setFooter({ text: 'System • Angelic Shop ✧' })
      .setTimestamp();

    // Section header styled like baltop
    const headerBlock =
      '╭──────────────────────────────╮\n' +
      '│   ✧ Available Blessings ✧   │\n' +
      '╰──────────────────────────────╯';

    embed.addFields({
      name: ' ',
      value: headerBlock,
      inline: false,
    });

    for (const item of shopItems) {
      const itemBlock =
        '╭──────────────────────────────╮\n' +
        `│  ${item.emoji} **${item.name}**             │\n` +
        `│  Price: \`${item.price.toLocaleString()} coins\`   │\n` +
        `│  ID: \`${item.id}\`                    │\n` +
        '╰──────────────────────────────╯';

      embed.addFields({
        name: ' ',
        value: [
          itemBlock,
          `*${item.description}*`,
          ''
        ].join('\n'),
        inline: false,
      });
    }

    return message.channel.send({ embeds: [embed] });
  },
};
