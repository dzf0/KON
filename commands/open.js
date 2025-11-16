const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'open',
  description: 'Open a specified amount of keys of a certain rarity.',
  async execute({ message, args, data, saveUserData }) {
    try {
      if (args.length < 2) {
        const embed = new EmbedBuilder()
          .setColor('#FFAA00')
          .setTitle('Invalid Usage')
          .setDescription('Usage: !open <rarity> <amount>');
        return message.channel.send({ embeds: [embed] });
      }

      const rarityInput = args[0];
      const rarity = rarityInput.toLowerCase();
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Invalid Amount')
          .setDescription('Please specify a valid positive amount greater than 0.');
        return message.channel.send({ embeds: [embed] });
      }

      const userInventory = data[message.author.id]?.inventory || {};

      // Find matching key ignoring case
      let keyFound = null;
      for (const invKey in userInventory) {
        if (invKey.toLowerCase() === rarity) {
          keyFound = invKey;
          break;
        }
      }

      if (!keyFound || userInventory[keyFound] < amount) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Insufficient Keys')
          .setDescription(`You do not have enough ${rarityInput} key(s) to open.`);
        return message.channel.send({ embeds: [embed] });
      }

      // Remove keys
      userInventory[keyFound] -= amount;
      if (userInventory[keyFound] <= 0) delete userInventory[keyFound];

      // Calculate rewards
      let totalKan = 0;
      for (let i = 0; i < amount; i++) {
        let reward = 0;
        switch (keyFound.toLowerCase()) {
          case 'prismatic':
            reward = Math.floor(Math.random() * 1000) + 1000;
            break;
          case 'mythical':
            reward = Math.floor(Math.random() * 500) + 500;
            break;
          case 'legendary':
            reward = Math.floor(Math.random() * 300) + 200;
            break;
          case 'rare':
            reward = Math.floor(Math.random() * 100) + 100;
            break;
          case 'uncommon':
            reward = Math.floor(Math.random() * 50) + 50;
            break;
          case 'common':
            reward = Math.floor(Math.random() * 30) + 10;
            break;
          default:
            reward = 0;
        }
        totalKan += reward;
      }

      if (!data[message.author.id].balance) data[message.author.id].balance = 0;
      data[message.author.id].balance += totalKan;

      saveUserData(data);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Keys Opened')
        .setDescription(`${message.author} opened ${amount} ${keyFound} key(s) and received a total of ${totalKan} 𝓚𝓪𝓷!`)
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error in open command:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('There was an error executing the open command. Please try again later.');
      message.channel.send({ embeds: [embed] });
    }
  },
};
