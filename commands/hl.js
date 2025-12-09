const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hl',
  description: 'Play Higher or Lower: guess if the next number will be higher or lower!',
  async execute({ message, args, userData, saveUserData }) {
    const bet = parseInt(args[0]);

    if (!bet || isNaN(bet) || bet <= 0)
      return message.channel.send('Usage: `.hl <amount>`');

    if (typeof userData.balance !== 'number') userData.balance = 0;

    if (userData.balance < bet)
      return message.channel.send("You don't have enough balance for this bet.");

    // Deduct bet first
    userData.balance -= bet;
    await saveUserData({ balance: userData.balance });

    // Start with a random number (1-99, so the next is always possible)
    let current = Math.floor(Math.random() * 99) + 1;
    let streak = 0;

    // NERF: fewer rounds and softer multipliers
    const maxRounds = 3;
    const multipliers = [0, 1.5, 2.2, 3]; 
    // index = streak; streak 1→1.5x, 2→2.2x, 3→3x

    let embed = new EmbedBuilder()
      .setTitle('🔼 Higher or Lower 🔽')
      .setDescription(
        `Current number: **${current}**\n` +
        `React 🔼 for Higher, 🔽 for Lower.\n` +
        `Streak: **0**\n` +
        `Payout caps at **${multipliers[maxRounds]}x** after ${maxRounds} correct guesses.`
      )
      .setColor('#3333aa')
      .setTimestamp();

    let statusMsg = await message.channel.send({ embeds: [embed] });
    await statusMsg.react('🔼');
    await statusMsg.react('🔽');

    const filter = (reaction, user) =>
      ['🔼', '🔽'].includes(reaction.emoji.name) && user.id === message.author.id;

    const collector = statusMsg.createReactionCollector({ filter, time: 60000 });

    async function endGame(won, payout, streakCount, finalNum) {
      let resultMsg;
      if (won) {
        userData.balance += payout;
        await saveUserData({ balance: userData.balance });
        resultMsg =
          `🎉 You survived ${streakCount} round(s)!\n` +
          `The next number was **${finalNum}**.\n` +
          `**You won ${payout}!**`;
      } else {
        resultMsg =
          `❌ You lost! The next number was **${finalNum}**.\n` +
          `Streak: ${streakCount}. You lost your bet.`;
      }
      const endEmbed = new EmbedBuilder()
        .setTitle('🔼 Higher or Lower 🔽 Result')
        .setDescription(resultMsg)
        .addFields({ name: 'Balance', value: userData.balance.toString(), inline: true })
        .setColor(won ? '#00FF00' : '#FF0000')
        .setTimestamp();
      await message.channel.send({ embeds: [endEmbed] });
    }

    collector.on('collect', async (reaction, user) => {
      await reaction.users.remove(user.id).catch(() => {});
      collector.resetTimer();

      const nextNum = Math.floor(Math.random() * 100) + 1;
      const picked = reaction.emoji.name === '🔼' ? 'higher' : 'lower';

      const correct =
        (picked === 'higher' && nextNum > current) ||
        (picked === 'lower' && nextNum < current);

      if (correct) {
        streak += 1;
        current = nextNum;

        // If reached max streak, cash out with nerfed multiplier
        if (streak >= maxRounds) {
          collector.stop('win');
          const payout = Math.floor(bet * multipliers[streak]);
          return endGame(true, payout, streak, nextNum);
        } else {
          const streakEmbed = new EmbedBuilder()
            .setTitle('🔼 Higher or Lower 🔽')
            .setDescription(
              `Correct! The new number is **${nextNum}**.\n` +
              `React for next guess.\n` +
              `Streak: **${streak}** (up to ${maxRounds})\n` +
              `Current potential: **${multipliers[streak]}x** your bet if you cash out on a lossless end.`
            )
            .setColor('#00cc00')
            .setTimestamp();
          await statusMsg.edit({ embeds: [streakEmbed] });
        }
      } else {
        collector.stop('fail');
        return endGame(false, 0, streak, nextNum);
      }
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'win' && reason !== 'fail') {
        message.channel.send('⏱️ Higher or Lower game timed out.');
      }
    });
  },
};
