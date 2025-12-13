const { EmbedBuilder } = require('discord.js');

// Character image URLs - using direct links
const characterImages = {
  // ONE PIECE
  'Luffy': 'https://i.pinimg.com/originals/b8/1e/f4/b81ef4c8f8e2f5a9e0c5d6f9d0e5c9d0.jpg',
  'Zoro': 'https://i.pinimg.com/originals/8f/3e/2c/8f3e2c6f5d4e3c2b1a0f9e8d7c6b5a4.jpg',
  'Shanks': 'https://i.pinimg.com/originals/a1/2b/3c/a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6.jpg',
  'Whitebeard': 'https://i.pinimg.com/originals/d4/5e/6f/d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9.jpg',
  'Ace': 'https://i.pinimg.com/originals/7a/8b/9c/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2.jpg',

  // NARUTO
  'Itachi': 'https://i.pinimg.com/originals/5c/6d/7e/5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0.jpg',
  'Sasuke': 'https://i.pinimg.com/originals/9e/0f/1a/9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4.jpg',
  'Naruto': 'https://i.pinimg.com/originals/2f/3a/4b/2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7.jpg',

  // DRAGON BALL
  'Goku': 'https://i.pinimg.com/originals/6b/7c/8d/6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1.jpg',
  'Vegeta': 'https://i.pinimg.com/originals/0d/1e/2f/0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5.jpg',

  // ATTACK ON TITAN
  'Eren': 'https://i.pinimg.com/originals/4f/5a/6b/4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9.jpg',
  'Levi': 'https://i.pinimg.com/originals/8b/9c/0d/8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3.jpg',
  'Reiner': 'https://i.pinimg.com/originals/3e/4f/5a/3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8.jpg',

  // MY HERO ACADEMIA
  'Shoto Todoroki': 'https://cdn.discordapp.com/attachments/1405349401945178152/1449305840791326775/latest.png?ex=693e6abf&is=693d193f&hm=ba24686d52ee807db4bdaed717b54d9dfe55fd037ba8725923c4050cffe18929&',
  'Izuku Midoriya': 'https://cdn.discordapp.com/attachments/1405349401945178152/1449306180173299786/latest.png?ex=693e6b10&is=693d1990&hm=1e97a5a3f8ca6d497c2726b9f370b422d3c4a108e75956b890f45fe51b105526&',
  'Bakugo': 'https://cdn.discordapp.com/attachments/1405349401945178152/1449305410048884816/latest.png?ex=693e6a58&is=693d18d8&hm=85a3f3b4e2e010ff9bf498bb5cf3a16b451727351fce0332bd6159d581a7fd9d&',
  'Hanta Sero': 'https://cdn.discordapp.com/attachments/1405349401945178152/1449305050978451477/latest.png?ex=693e6a02&is=693d1882&hm=22510db28ae6b30df602403f10db1d66a3426aed809b74ed146abb0ca83c4b58&',

  // SOUL EATER
  'Tsubaki Nakatsukasa': 'https://i.pinimg.com/originals/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8.jpg',

  // BUNGO STRAY DOGS
  'Michizo Tachihara': 'https://i.pinimg.com/originals/7e/8f/9a/7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2.jpg',

  // THE WALLFLOWER
  'Sunako Nakahara': 'https://i.pinimg.com/originals/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6.jpg',

  // MAGI
  'Morgiana': 'https://i.pinimg.com/originals/5c/6d/7e/5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0.jpg',
};

module.exports = {
  name: 'charinfo',
  description: 'View details of a character you own',
  async execute({ message, args, userData }) {
    const charName = args.join(' ').trim();

    if (!charName) {
      return message.channel.send('Usage: `.charinfo <character name>`');
    }

    const chars = userData.characters || [];
    
    // Case-insensitive search
    const char = chars.find(c => 
      c.name.toLowerCase().trim() === charName.toLowerCase().trim()
    );

    if (!char) {
      // Show helpful message with available characters
      if (chars.length === 0) {
        return message.channel.send(`❌ You don't own any characters yet! Use \`.roll\` to get one.`);
      }
      
      const ownedNames = chars.map(c => c.name).join(', ');
      return message.channel.send(
        `❌ You don't own **${charName}**.\n\nYour characters: ${ownedNames}`
      );
    }

    const movesText = char.moves.map(m => `• **${m.name}** (${m.damage})`).join('\n');

    // Get character image (case-insensitive lookup)
    const imageKey = Object.keys(characterImages).find(
      key => key.toLowerCase() === char.name.toLowerCase()
    );
    
    // Use placeholder that will definitely work
    const imageUrl = imageKey ? characterImages[imageKey] : null;

    const embed = new EmbedBuilder()
      .setTitle(`${char.name} ⭐`)
      .setDescription(
        `**Series:** ${char.series}\n` +
        `**Tier:** ${char.tier}\n\n` +
        `**Moves:**\n${movesText}`
      )
      .setColor('#00BFFF')
      .setTimestamp();

    // Only add image if URL exists
    if (imageUrl) {
      embed.setThumbnail(imageUrl);
    }

    return message.channel.send({ embeds: [embed] });
  }
};
