const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'silver_coin',   name: 'silv_token',    price: 10000, emoji: '🔘',   description: 'A shiny coin for exchanging robux and more!' },
  { id: 'common_key',    name: 'Common',        price: 100,   emoji: '🔑',   description: 'gives kan' },
  { id: 'rare_key',      name: 'Rare',          price: 500,   emoji: '🗝',   description: 'gives currency' },
  { id: 'legendary_key', name: 'Legendary',     price: 900,   emoji: '🔑',   description: 'gives currency' },
];

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  async execute({ message, args, userData, saveUserData }) {
    const userId = message.author.id;

    // ensure user object exists
    if (!userData[userId] || typeof userData[userId] !== 'object') {
      userData[userId] = { balance: 0, inventory: {} };
    }
    if (!userData[userId].inventory || typeof userData[userId].inventory !== 'object') {
      userData[userId].inventory = {};
    }

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

    if (typeof userData[userId].balance !== 'number') userData[userId].balance = 0;

    if (userData[userId].balance < totalPrice) {
      const needed = totalPrice - userData[userId].balance;
      return message.channel.send(
        `❌ Insufficient balance! You need **${needed}** more coins.\n` +
        `Your balance: **${userData[userId].balance}** coins`
      );
    }

    // deduct price
    userData[userId].balance -= totalPrice;

    // add to inventory; for keys, we store by rarity name used elsewhere
    userData[userId].inventory[item.name] =
      (userData[userId].inventory[item.name] || 0) + quantity;

    // save to data.json (your saveUserData in main file takes no args)
    saveUserData();

    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Complete')
      .setDescription(`You bought **${quantity}x ${item.emoji} ${item.name}**`)
      .addFields(
        { name: 'Price per Item', value: `${item.price} coins`, inline: true },
        { name: 'Total Price', value: `${totalPrice} coins`, inline: true },
        { name: 'Quantity', value: `${quantity}x`, inline: true },
        { name: 'New Balance', value: `${userData[userId].balance} coins`, inline: false },
        { name: 'Total Owned', value: `${userData[userId].inventory[item.name]}x`, inline: false }
      )
      .setColor('#00FF00')
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  },
};
