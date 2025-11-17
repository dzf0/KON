const { EmbedBuilder } = require('discord.js');

const validRarities = [
  'Prismatic', 'Mythical', 'Legendary', 'Rare', 'Uncommon', 'Common'
];

module.exports = {
  name: 'open',
  description: 'Open one or more keys of the given rarity to receive prizes.',
  async execute({ message, args, userData, saveUserData }) {
    try {
      const rarityArg = args[0];
      if (!rarityArg) {
        return message.channel.send('Please specify a key rarity to open (e.g., `!open Rare`).');
      }

      // Case-insensitive rarity match
      const rarity = validRarities.find(
        r => r.toLowerCase() === rarityArg.toLowerCase()
      );
      if (!rarity) {
        return message.channel.send('Invalid key rarity specified.');
      }

      // Parse amount, default to 1
      let amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) amount = 1;

      // Defensive user data initialization
      const userId = message.author.id;
      if (!userData || typeof userData !== 'object') {
        return message.channel.send('User data is not available.');
      }
      if (!userData[userId] || typeof userData[userId] !== 'object') {
        userData[userId] = { balance: 0, inventory: {} };
      }
      if (!userData[userId].inventory || typeof userData[userId].inventory !== 'object') {
        userData[userId].inventory = {};
      }

      // Check key quantity
      const currentAmount = userData[userId].inventory[rarity] || 0;
      if (currentAmount < amount) {
        return message.channel.send(`You do not have enough **${rarity}** keys to open (**${amount}** requested, you have **${currentAmount}**).`);
      }

      // Open keys, compute total reward
      let totalReward = 0;
      const minReward = 10, maxReward = 100;
      for (let i = 0; i < amount; i++) {
        totalReward += Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
      }

      userData[userId].inventory[rarity] -= amount;
      userData[userId].balance += totalReward;
      saveUserData();

      const embed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('Keys Opened!')
        .setDescription(`${message.author} opened **${amount} ${rarity}** key${amount > 1 ? 's' : ''} and received **${totalReward} coins**!`)
        .addFields(
          { name: 'Keys left', value: `${userData[userId].inventory[rarity]}`, inline: true },
          { name: 'New Balance', value: `${userData[userId].balance} coins`, inline: true }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Error in open command:', error);
      message.channel.send('❌ Something went wrong while opening your key(s).');
    }
  }
};
