const { EmbedBuilder } = require('discord.js');

const validRarities = [
  'Prismatic', 'Mythical', 'Legendary', 'Rare', 'Uncommon', 'Common'
];

module.exports = {
  name: 'open',
  description: 'Open one or more keys of the given rarity to receive prizes.',
  async execute({ message, args, userData, saveUserData }) {
    try {
      // === Parse Arguments ===
      const rarityArg = args[0];
      if (!rarityArg) {
        return message.channel.send('Please specify a key rarity to open (e.g. `!open Rare`).');
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

      // === Defensive User Data Checks ===
      const userId = message.author.id;
      if (!userData || typeof userData !== 'object') {
        return message.channel.send('Bot error: user data is not available.');
      }
      // If not present, create an entry for this user
      if (!userData[userId] || typeof userData[userId] !== 'object') {
        userData[userId] = { balance: 0, inventory: {} };
      }
      // Inventory must be an object
      if (!userData[userId].inventory || typeof userData[userId].inventory !== 'object') {
        userData[userId].inventory = {};
      }
      // Ensure keys property exists and is a number
      if (typeof userData[userId].inventory[rarity] !== 'number') {
        userData[userId].inventory[rarity] = 0;
      }

      // === Does User Have Enough Keys? ===
      const currentAmount = userData[userId].inventory[rarity];
      if (currentAmount < amount) {
        return message.channel.send(`You do not have enough **${rarity}** keys to open (**${amount}** requested, you have **${currentAmount}**).`);
      }

      // === Open Keys, Give Rewards ===
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
