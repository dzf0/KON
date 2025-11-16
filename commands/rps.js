const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rps',
  description: 'Play rock-paper-scissors with the bot.',
  async execute({ message, args }) {
    const choices = ['rock', 'paper', 'scissors'];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return message.channel.send('Please choose rock, paper, or scissors. Usage: !rps <choice>');
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'You win!';
    } else {
      result = 'You lose!';
    }

    const embed = new EmbedBuilder()
      .setTitle('Rock Paper Scissors')
      .addFields(
        { name: 'Your Choice', value: userChoice, inline: true },
        { name: "Bot's Choice", value: botChoice, inline: true },
        { name: 'Result', value: result }
      )
      .setColor(result === 'You win!' ? '#00FF00' : result === 'You lose!' ? '#FF0000' : '#FFFF00')
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
