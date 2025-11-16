const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { name: 'Common Key', price: 50 },
  { name: 'Rare Key', price: 200 },
  { name: 'Legendary Key', price: 500 },
  { name: 'Mythical Sword', price: 1000 },
];

module.exports = {
  name: 'buy',
  description: 'Buy items from the shop.',
  async execute({ message, args, data, saveUserData }) {
    const itemName = args[0]?.toLowerCase();
    const quantity = parseInt(args[1]) || 1;

    if (!itemName) {
      const embed = new EmbedBuilder()
        .setColor('#FFAA00')
        .setTitle('Invalid Usage')
        .setDescription('Please specify an item to buy. Usage: !buy <item> [quantity]');
      return message.channel.send({ embeds: [embed] });
    }

    if (quantity <= 0 || isNaN(quantity)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Invalid Quantity')
        .setDescription('Quantity must be a positive number.');
      return message.channel.send({ embeds: [embed] });
    }

    const item = shopItems.find(i => i.name.toLowerCase() === itemName);
    if (!item) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Item Not Found')
        .setDescription(`The item "${args[0]}" does not exist in the shop.`);
      return message.channel.send({ embeds: [embed] });
    }

    const totalCost = item.price * quantity;

    if (!data[message.author.id]) data[message.author.id] = { balance: 0, inventory: {} };
    if (data[message.author.id].balance < totalCost) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Insufficient Funds')
        .setDescription(`You do not have enough currency to buy ${quantity} ${item.name}(s).`);
      return message.channel.send({ embeds: [embed] });
    }

    // Deduct cost
    data[message.author.id].balance -= totalCost;

    // Add items to inventory
    if (!data[message.author.id].inventory[item.name]) {
      data[message.author.id].inventory[item.name] = 0;
    }
    data[message.author.id].inventory[item.name] += quantity;

    saveUserData(data);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Purchase Successful')
      .setDescription(`You bought ${quantity} ${item.name}(s) for ${totalCost} currency.`)
      .addFields({ name: 'New Balance', value: data[message.author.id].balance.toString(), inline: true });

    message.channel.send({ embeds: [embed] });
  },
};
