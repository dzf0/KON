const { EmbedBuilder } = require('discord.js');
const keydrop = require('./keydrop.js');

module.exports = {
  name: 'redeem',
  description: 'Claim the currently dropped key.',
  async execute({ message, addKeyToInventory }) {
    const currentKey = keydrop.getCurrentKey();

    // No key or already claimed
    if (!currentKey || currentKey.claimed) {
      const reply = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('No Active Key')
            .setDescription('There is no key available to claim right now, or it has already been claimed.')
            .setColor('Red')
            .setTimestamp(),
        ],
      });

      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000); // delete after 5 seconds

      return;
    }

    // Try to claim
    const success = await keydrop.claimKey(message.author.id, addKeyToInventory);

    if (success) {
      const embed = new EmbedBuilder()
        .setTitle('🔑 Key Claimed!')
        .setDescription(`You claimed a **${currentKey.rarity}** key! Check your inventory with `.inventory`.`)
        .setColor('Green')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } else {
      // Edge case: claim failed (already claimed by someone else)
      const reply = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Too Late!')
            .setDescription('That key has already been claimed.')
            .setColor('Red')
            .setTimestamp(),
        ],
      });

      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);

      return;
    }
  },
};
