const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'bal',
  description: 'Check your or another user\'s balance.',
  async execute({ message, args, data }) {
    let user = message.author;

    if (args.length > 0) {
      const userMention = message.mentions.users.first();
      if (userMention) {
        user = userMention;
      }
    }

    if (!data[user.id] || typeof data[user.id].balance !== 'number') {
      const noDataEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('No Data Found')
        .setDescription(`No balance data found for ${user.username}.`);
      return message.channel.send({ embeds: [noDataEmbed] });
    }

    const balanceEmbed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle(`${user.username}'s Balance`)
      .setDescription(`${user.username} has ${data[user.id].balance} 𝓚𝓪𝓷.`)
      .setTimestamp();

    message.channel.send({ embeds: [balanceEmbed] });
  },
};
