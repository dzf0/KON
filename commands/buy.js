const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'silv_token', name: 'Silv token', price: 10000, emoji: '<:SILV_TOKEN:1447678878448484555>', description: 'A shiny coin for exchanging robux and more!' },
  { id: 'common', name: 'Common', price: 100, description: 'gives kan' },
  { id: 'rare', name: 'Rare', price: 500, description: 'gives currency' },
  { id: 'legendary', name: 'Legendary', price: 900, description: 'gives currency' },
];

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  async execute({ message, args, userData, saveUserData }) {
    const itemIdInput = args[0]?.toLowerCase();
    let quantity = parseInt(args[1]) || 1;

    if (!itemIdInput) {
      return message.channel.send(
        'Usage: `.buy <item_id> [quantity]`\n' +
        'Example: `.buy common 2`\n' +
        'Use `.shop` to see all items.'
      );
    }

    if (quantity <= 0) {
      return message.channel.send('❌ Quantity must be at least 1.');
    }

    const item = shopItems.find(i => i.id.toLowerCase() === itemIdInput);
    if (!item) {
      return message.channel.send(
        `❌ Item **${itemIdInput}** not found in shop.\nUse \`.shop\` to see available items.`
      );
    }

    const totalPrice = item.price * quantity;
    const currentBalance = userData.balance || 0;

    if (currentBalance < totalPrice) {
      const needed = totalPrice - currentBalance;
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFB3C6')
            .setTitle('✧˚₊‧ ❌ 𝔦𝔫𝔰𝔲𝔣𝔣𝔦𝔠𝔦𝔢𝔫𝔱 𝔟𝔞𝔩𝔞𝔫𝔠𝔢 ‧₊˚✧')
            .setDescription(`You need **${needed}** more coins to complete this purchase.`)
            .addFields(
              { name: '💰 Your Balance', value: `**${currentBalance}** coins`, inline: true },
              { name: '💸 Item Price', value: `**${totalPrice}** coins`, inline: true }
            )
            .setFooter({ text: 'System • Shop' })
        ]
      });
    }

    userData.balance -= totalPrice;

    userData.inventory = userData.inventory || {};
    userData.inventory[item.name] = (userData.inventory[item.name] || 0) + quantity;

    await saveUserData({
      balance: userData.balance,
      inventory: userData.inventory,
    });

    const embed = new EmbedBuilder()
      .setTitle('˗ˏˋ 𐙚 ✅ 𝔓𝔲𝔯𝔠𝔥𝔞𝔰𝔢 ℭ𝔬𝔪𝔭𝔩𝔦𝔠𝔱𝔯 𐙚 ˎˊ˗')
      .setDescription(
        `꒰ঌ You bought **${quantity}x** ${item.emoji} **${item.name}** ໒꒱`
      )
      .addFields(
        { name: '💵 Price per Item', value: `**${item.price}** coins`, inline: true },
        { name: '💸 Total Price', value: `**${totalPrice}** coins`, inline: true },
        { name: '📦 Quantity', value: `**${quantity}x**`, inline: true },
        { name: '💰 New Balance', value: `**${userData.balance}** coins`, inline: false },
        { name: '🎁 Total Owned', value: `**${userData.inventory[item.name]}x**`, inline: false }
      )
      .setColor('#C1FFD7')
      .setTimestamp()
      .setFooter({ text: 'System • Shop' });

    return message.channel.send({ embeds: [embed] });
  },
};
