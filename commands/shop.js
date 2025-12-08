const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'silv_token', name: 'silv token', price: 10000, emoji: '🪙', description: 'Used to buy robux and more' },
  { id: 'common_key', name: 'common key', price: 100, emoji: '🔑', description: 'Opens common rewards' },
  { id: 'rare_key', name: 'rare key', price: 500, emoji: '🗝️', description: 'Opens rare rewards' },
  { id: 'legendary_key', name: 'legendary key', price: 900, emoji: '🗝️', description: 'Opens legendary rewards' },
];

module.exports = {
  name: 'shop',
  description: 'View the shop and available items to buy',
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setTitle('🏪 Shop')
      .setDescription('Use `!buy <item_id> [quantity]` to purchase an item')
      .setColor('#FFD700')
      .setTimestamp();

    for (const item of shopItems) {
      embed.addFields({
        name: `${item.emoji} ${item.name}`,
        value: `**Price:** ${item.price} coins\n${item.description}\n**ID:** \`${item.id}\``,
        inline: false,
      });
    }

    message.channel.send({ embeds: [embed] });
  },
};
