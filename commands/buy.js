const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'silv_token', name: 'silv_token', price: 10000, emoji: '🔘', description: 'A shiny coin for exchanging robux and more!' },
  { id: 'common_key', name: 'Common', price: 100, emoji: '🔑', description: 'gives kan' },
  { id: 'rare_key', name: 'Rare', price: 500, emoji: '🗝', description: 'gives currency' },
  { id: 'legendary_key', name: 'Legendary', price: 900, emoji: '🔑', description: 'gives currency' },
];

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  async execute({ message, args, getUserData }) {
    const userId = message.author.id;
    const userData = await getUserData(userId);

    const itemId = args[0]?.toLowerCase();
    let quantity = parseInt(args[1]) || 1;

    if (!itemId) {
      return message.channel.send(
        'Usage: `!buy <item_id> [quantity]`\n' +
        'Example: `!buy common_key 2`\n' +
        'Use `!shop` to see all items.'
      );
    }

    if (quantity <= 0) {
      return message.channel.send('❌ Quantity must be at least 1.');
    }

    const item = shopItems.find(i => i.id === itemId);
    if (!item) {
      return message.channel.send(
        `❌ Item **${itemId}** not found in shop.\nUse \`!shop\` to see available items.`
      );
    }

    const totalPrice = item.price * quantity;
    const currentBalance = userData.balance || 0;

    if (currentBalance < totalPrice) {
      const needed = totalPrice - currentBalance;
      return message.channel.send(
        `❌ Insufficient balance! You need **${needed}** more coins.\n` +
        `Your balance: **${currentBalance}** coins\n` +
        `Item price: **${totalPrice}** coins`
      );
    }

    // Deduct price
    userData.balance -= totalPrice;

    // Add to inventory (MongoDB uses Map)
    const currentAmount = userData.inventory.get(item.name) || 0;
    userData.inventory.set(item.name, currentAmount + quantity);

    // Save to MongoDB
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Complete')
      .setDescription(`You bought **${quantity}x ${item.emoji} ${item.name}**`)
      .addFields(
        { name: 'Price per Item', value: `${item.price} coins`, inline: true },
        { name: 'Total Price', value: `${totalPrice} coins`, inline: true },
        { name: 'Quantity', value: `${quantity}x`, inline: true },
        { name: 'New Balance', value: `${userData.balance} coins`, inline: false },
        { name: 'Total Owned', value: `${userData.inventory.get(item.name)}x`, inline: false }
      )
      .setColor('#00FF00')
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
};
