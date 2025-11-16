const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show a list of available commands with usage.',
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setTitle('Help - Command List')
      .setColor('#00BFFF')
      .setDescription('Here is a list of all commands and their usage:')
      .addFields(
        { name: '!admin give keys <rarity> <amount> <@user>', value: 'Give keys to user (admin only).' },
        { name: '!admin give currency <amount> <@user>', value: 'Give 𝓚𝓪𝓷 currency to user (admin only).' },
        { name: '!admin remove keys <rarity> <amount> <@user>', value: 'Remove keys from user (admin only).' },
        { name: '!admin remove currency <amount> <@user>', value: 'Remove 𝓚𝓪𝓷 currency from user (admin only).' },
        { name: '!admin removekan <@user> <amount>', value: 'Remove only 𝓚𝓪𝓷 currency from user (admin only).' },
        { name: '!admin resetstats <user_id>', value: 'Reset a user\'s stats and inventory (admin only).' },
        { name: '!admin reset <user_id>', value: 'Reset a user\'s entire data (admin only).' },
        { name: '!claim', value: 'Claim a dropped key if available.' },
        { name: '!open <rarity> <amount>', value: 'Open a specified amount of keys to get rewards.' },
        { name: '!buy <item> [quantity]', value: 'Buy items from the shop.' },
        { name: '!inventory', value: 'View your inventory items and quantities.' },
        { name: '!balance [@user]', value: 'Check your or another user\'s 𝓚𝓪𝓷 balance.' },
        { name: '!coinflip <amount>', value: 'Flip a coin and bet 𝓚𝓪𝓷 currency.' },
        { name: '!rps <rock|paper|scissors>', value: 'Play rock-paper-scissors against the bot.' },
        { name: '!slots <amount>', value: 'Play a slots machine game with bets.' },
        { name: '!guess [number|stop]', value: 'Admins start/stop guessing game; users guess numbers.' },
        { name: '!help [command]', value: 'Show this help or detailed info for a specific command.' },
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
