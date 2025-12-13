const { EmbedBuilder } = require('discord.js');

// Character image URLs (you can replace these with better quality images)
const characterImages = {
  // ONE PIECE
  'Luffy': 'https://i.imgur.com/6QZ8Z5k.png',
  'Zoro': 'https://i.imgur.com/nB6X8Yb.png',
  'Shanks': 'https://i.imgur.com/9Z8Z5k.png',
  'Whitebeard': 'https://i.imgur.com/7Z8Z5k.png',
  'Ace': 'https://i.imgur.com/5Z8Z5k.png',

  // NARUTO
  'Itachi': 'https://i.imgur.com/4Z8Z5k.png',
  'Sasuke': 'https://i.imgur.com/3Z8Z5k.png',
  'Naruto': 'https://i.imgur.com/2Z8Z5k.png',

  // DRAGON BALL
  'Goku': 'https://i.imgur.com/1Z8Z5k.png',
  'Vegeta': 'https://i.imgur.com/8Z8Z5k.png',

  // ATTACK ON TITAN
  'Eren': 'https://i.imgur.com/9Z8Z5k.png',
  'Levi': 'https://i.imgur.com/0Z8Z5k.png',
  'Reiner': 'https://i.imgur.com/aZ8Z5k.png',

  // MY HERO ACADEMIA
  'Shoto Todoroki': 'https://i.imgur.com/bZ8Z5k.png',
  'Izuku Midoriya': 'https://i.imgur.com/cZ8Z5k.png',
  'Bakugo': 'https://i.imgur.com/dZ8Z5k.png',
  'Hanta Sero': 'https://i.imgur.com/eZ8Z5k.png',

  // SOUL EATER
  'Tsubaki Nakatsukasa': 'https://i.imgur.com/fZ8Z5k.png',

  // BUNGO STRAY DOGS
  'Michizo Tachihara': 'https://i.imgur.com/gZ8Z5k.png',

  // THE WALLFLOWER
  'Sunako Nakahara': 'https://i.imgur.com/hZ8Z5k.png',

  // MAGI
  'Morgiana': 'https://i.imgur.com/iZ8Z5k.png',
};

module.exports = {
  name: 'charinfo',
  description: 'View details of a character you own',
  async execute({ message, args, userData }) {
    const charName = args.join(' ');

    if (!charName) {
      return message.channel.send('Usage: `.charinfo <character name>`');
    }

    const chars = userData.characters || [];
    const char = chars.find(c => c.name.toLowerCase() === charName.toLowerCase());

    if (!char) {
      return message.channel.send(`❌ You don't own **${charName}**.`);
    }

    const movesText = char.moves.map(m => `• **${m.name}** (${m.damage})`).join('\n');

    // Get character image
    const imageUrl = characterImages[char.name] || 'https://i.imgur.com/default.png';

    const embed = new EmbedBuilder()
      .setTitle(char.name)
      .setDescription(
        `**Series:** ${char.series}\n` +
        `**Tier:** ${char.tier}\n\n` +
        `**Moves:**\n${movesText}`
      )
      .setThumbnail(imageUrl) // Character portrait in top-right
      .setColor('#00BFFF')
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }
};
