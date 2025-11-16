const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inventory',
  description: 'Display your inventory items.',
  async execute({ message, data }) {
    const userId = message.author.id;
    const userData = data[userId];

    if (!userData || !userData.inventory || Object.keys(userData.inventory).length === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Inventory')
        .setDescription('Your inventory is empty.');

      return message.channel.send({ embeds: [emptyEmbed] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username}'s Inventory`)
      .setColor('#00BFFF')
      .setTimestamp();

    let description = '';

    for (const [item, quantity] of Object.entries(userData.inventory)) {
      description += `**${item}**: ${quantity}\n`;
    }

    embed.setDescription(description);

    message.channel.send({ embeds: [embed] });
  },
};
