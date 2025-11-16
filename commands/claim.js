const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'claim',
  description: 'Claim the currently dropped key if available.',
  async execute({ message, currentKey, keyClaimed, addKeyToInventory, saveUserData, data }) {
    if (!currentKey.value) {
      const noKeyEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('No Key to Claim')
        .setDescription('There is currently no key available to claim.');
      return message.channel.send({ embeds: [noKeyEmbed] });
    }

    if (keyClaimed.value) {
      const claimedEmbed = new EmbedBuilder()
        .setColor('#FFAA00')
        .setTitle('Key Already Claimed')
        .setDescription('Sorry, this key has already been claimed.');
      return message.channel.send({ embeds: [claimedEmbed] });
    }

    if (message.channel.id !== currentKey.value.channelId) {
      const wrongChannelEmbed = new EmbedBuilder()
        .setColor('#FFAA00')
        .setTitle('Wrong Channel')
        .setDescription('You must claim the key in the channel where it dropped.');
      return message.channel.send({ embeds: [wrongChannelEmbed] });
    }

    // Give key to user
    addKeyToInventory(message.author.id, currentKey.value.rarity, 1);
    saveUserData(data);

    keyClaimed.value = true;
    currentKey.value.claimerId = message.author.id;

    const successEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Key Claimed!')
      .setDescription(`${message.author} claimed the **${currentKey.value.rarity}** key! Congratulations!`);
    message.channel.send({ embeds: [successEmbed] });
  },
};
