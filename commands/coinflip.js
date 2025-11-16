const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'cf',
  description: 'Flip a coin and bet on heads(h) or tails(t).',
  async execute({ message, args, data, saveUserData }) {
    if (args.length < 2) {
      return message.channel.send('Usage: !coinflip <amount> <heads|tails>');
    }

    const betAmount = parseInt(args[0]);
    const guess = args[1].toLowerCase();

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.channel.send('Please enter a valid positive amount to bet.');
    }

    if (guess !== 'h' && guess !== 't') {
      return message.channel.send('You must bet on "heads" or "tails".');
    }

    const userId = message.author.id;

    if (!data[userId]) data[userId] = { balance: 0, inventory: {} };
    if (!data[userId].balance || data[userId].balance < betAmount) {
      return message.channel.send('You do not have enough balance to place that bet.');
    }

    const coinSides = ['h', 't'];
    const result = coinSides[Math.floor(Math.random() * coinSides.length)];

    let embed = new EmbedBuilder()
      .setTitle('Coin Flip Result')
      .setTimestamp();

    if (guess === result) {
      // User wins double the bet amount
      const winnings = betAmount * 2;
      data[userId].balance += winnings;
      embed.setColor('#00FF00')
           .setDescription(`${message.author}, The coin landed on **${result}**. You won ${winnings} currency!`)
           .addFields(
             { name: 'New Balance', value: data[userId].balance.toString(), inline: true }
           );
    } else {
      // User loses bet amount
      data[userId].balance -= betAmount;
      embed.setColor('#FF0000')
           .setDescription(`${message.author}, The coin landed on **${result}**. You lost ${betAmount} currency.`)
           .addFields(
             { name: 'New Balance', value: data[userId].balance.toString(), inline: true }
           );
    }

    saveUserData(data);

    message.channel.send({ embeds: [embed] });
  },
};
