const { EmbedBuilder } = require('discord.js');
const keydrop = require('./keydrop.js');

module.exports = {
  name: 'claim',
  description: 'Claim the currently dropped key.',
  async execute({ message, userData, addKeyToInventory, saveUserData }) {
    // Your keydrop.js should expose currentKey and claimKey!
    const currentKey = keydrop.getCurrentKey();

    if (currentKey && !currentKey.claimed) {
      // Claim the key, award to the user, and persist
      keydrop.claimKey(
        message.author.id,
        userData,
        addKeyToInventory,
        saveUserData
      );

      const embed = new EmbedBuilder()
        .setTitle('Key Claimed!')
        .setDescription(`You claimed a **${currentKey.rarity}** key! Check your inventory with \`!inventory\`.`)
        .setColor('Green')
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('No Active Key')
        .setDescription('There is no key available to claim right now.')
        .setColor('Red')
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }
  }
};
