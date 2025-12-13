const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'characters',
  description: 'View your character collection',
  async execute({ message, userData }) {
    const chars = userData.characters || [];

    if (chars.length === 0) {
      return message.channel.send('❌ You don\'t have any characters yet! Use `.roll` to get one.');
    }

    // Group by tier
    const grouped = {};
    for (const char of chars) {
      if (!grouped[char.tier]) grouped[char.tier] = [];
      grouped[char.tier].push(char.name);
    }

    let description = '';
    for (const tier of ['S+', 'S', 'A', 'B', 'C', 'D']) {
      if (grouped[tier]) {
        description += `\n**${tier} Tier:**\n${grouped[tier].join(', ')}\n`;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username}'s Character Collection`)
      .setDescription(description || 'No characters.')
      .setColor('#FFD700')
      .setFooter({ text: `Total: ${chars.length} characters` })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
