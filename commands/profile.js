const { EmbedBuilder } = require('discord.js');

const SILV_ROLE_ID = '1452178800459645026'; // Users with this role can customize

module.exports = {
  name: 'profile',
  description: 'View and customize your profile. SILV role unlocks customization!',
  async execute({ message, args, userData, saveUserData }) {
    const targetUser = message.mentions.users.first() || message.author;
    
    // Viewing someone else's profile
    if (targetUser.id !== message.author.id) {
      return viewProfile(message, targetUser, userData);
    }

    // Own profile management
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'customize') {
      // Check SILV role for customization
      if (!message.member.roles.cache.has(SILV_ROLE_ID)) {
        return message.channel.send(
          '❌ Only SILV members can customize profiles!\n' +
          'Buy SILV tokens to unlock customization: `.silvshop buy silv_token 1`'
        );
      }

      const customOption = args[1]?.toLowerCase();

      if (customOption === 'color') {
        const color = args[2];
        if (!color || !color.match(/^#[0-9A-F]{6}$/i)) {
          return message.channel.send(
            'Usage: `.profile customize color #HEXCODE`\n' +
            'Example: `.profile customize color #FF0000`'
          );
        }

        userData.profileColor = color;
        await saveUserData({ profileColor: color });
        
        const embed = new EmbedBuilder()
          .setTitle('✅ Profile Color Updated')
          .setDescription(`Your profile color is now **${color}**`)
          .setColor(color)
          .setTimestamp();
        
        return message.channel.send({ embeds: [embed] });
      }

      if (customOption === 'bio') {
        const bio = args.slice(2).join(' ');
        if (!bio) {
          return message.channel.send('Usage: `.profile customize bio <your bio (max 100 chars)>`');
        }
        if (bio.length > 100) {
          return message.channel.send('❌ Bio must be under 100 characters!');
        }

        userData.profileBio = bio;
        await saveUserData({ profileBio: bio });
        
        return message.channel.send(`✅ Bio updated to: **${bio}**`);
      }

      if (customOption === 'banner') {
        const bannerText = args.slice(2).join(' ');
        if (!bannerText) {
          return message.channel.send('Usage: `.profile customize banner <text (max 50 chars)>`');
        }
        if (bannerText.length > 50) {
          return message.channel.send('❌ Banner text must be under 50 characters!');
        }

        userData.profileBanner = bannerText;
        await saveUserData({ profileBanner: bannerText });
        
        const embed = new EmbedBuilder()
          .setTitle('✅ Banner Updated')
          .setDescription(`Your banner is now: **${bannerText}**`)
          .setColor('#F5E6FF')
          .setTimestamp();
        
        return message.channel.send({ embeds: [embed] });
      }

      return message.channel.send(
        '**SILV Member Customization:**\n' +
        '`.profile customize color #HEXCODE` - Change profile color\n' +
        '`.profile customize bio <text>` - Add/update bio (max 100 chars)\n' +
        '`.profile customize banner <text>` - Add banner text (max 50 chars)'
      );
    }

    if (subcommand === 'reset') {
      if (!message.member.roles.cache.has(SILV_ROLE_ID)) {
        return message.channel.send('❌ Only SILV members can reset customization!');
      }

      userData.profileColor = undefined;
      userData.profileBio = undefined;
      userData.profileBanner = undefined;

      await saveUserData({ 
        profileColor: null,
        profileBio: null,
        profileBanner: null
      });

      return message.channel.send('✅ Profile customization reset to default!');
    }

    // View own profile
    return viewProfile(message, message.author, userData);
  }
};

function viewProfile(message, user, userData) {
  const isSilvMember = message.member?.roles.cache.has('1382513369801555988') || false;
  const profileColor = userData.profileColor || '#F5E6FF';
  const profileBio = userData.profileBio || 'No bio set';
  const profileBanner = userData.profileBanner || null;

  // Build header with proper banner display
  let headerLine1 = `│  ${user.username.toUpperCase()}`;
  if (isSilvMember) {
    headerLine1 += ' ⭐ SILV MEMBER ⭐';
  }
  headerLine1 += '  │';

  let headerBlock =
    '╭───────────────────────────────────────────╮\n' +
    headerLine1 + '\n';
  
  if (profileBanner) {
    headerBlock +=
      `│  ✨ ${profileBanner.padEnd(37)} ✨ │\n`;
  }
  
  headerBlock +=
    '╰───────────────────────────────────────────╯';

  const embed = new EmbedBuilder()
    .setTitle(`˗ˏˋ 𐙚 🎮 ${user.username}'s Profile 𐙚 ˎˊ˗`)
    .setDescription(
      [
        headerBlock,
        '',
        `**Bio:** _${profileBio}_`,
        ''
      ].join('\n')
    )
    .setColor(profileColor)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setTimestamp();

  // Economy Stats
  const silv = userData.inventory?.silv_token || 0;
  const balance = userData.balance || 0;

  const economyValue =
    `🪙 **Coins:** \`${balance.toLocaleString()}\`\n` +
    `🜂 **SILV Tokens:** \`${silv}\``;

  embed.addFields({
    name: '💰 ECONOMY',
    value: economyValue,
    inline: true
  });

  // Character Collection
  const characters = userData.characters || {};
  const characterCount = Object.keys(characters).length;
  const characterTiers = Object.values(characters).reduce((acc, char) => {
    acc[char.tier] = (acc[char.tier] || 0) + 1;
    return acc;
  }, {});

  let characterValue = `**Total:** ${characterCount}`;
  if (characterCount > 0) {
    characterValue += '\n';
    if (characterTiers.S) characterValue += `**S Tier:** ${characterTiers.S}\n`;
    if (characterTiers.A) characterValue += `**A Tier:** ${characterTiers.A}\n`;
    if (characterTiers.B) characterValue += `**B Tier:** ${characterTiers.B}\n`;
    if (characterTiers.C) characterValue += `**C Tier:** ${characterTiers.C}`;
  } else {
    characterValue += '\n_(No characters yet)_';
  }

  embed.addFields({
    name: '⭐ CHARACTERS',
    value: characterValue,
    inline: true
  });

  // Exclusive Items
  const exclusiveItems = Object.entries(userData.inventory || {})
    .filter(([key]) => 
      key.toLowerCase().includes('mythic') || 
      key.toLowerCase().includes('silv') ||
      key.toLowerCase().includes('rare') ||
      key.toLowerCase().includes('legendary')
    )
    .map(([item, count]) => `**${item}:** ${count}`)
    .slice(0, 5);

  embed.addFields({
    name: '🎁 EXCLUSIVE ITEMS',
    value: exclusiveItems.length > 0 ? exclusiveItems.join('\n') : '_(No exclusive items yet)_',
    inline: true
  });

  // Achievements
  const achievements = [];
  if (silv >= 5) achievements.push('🜂 SILV Collector');
  if (characterCount >= 10) achievements.push('⭐ Character Enthusiast');
  if (characterCount >= 50) achievements.push('🌟 Character Master');
  if (balance >= 1000000) achievements.push('💰 Million Coins');
  if (isSilvMember) achievements.push('✨ SILV Member');

  if (achievements.length > 0) {
    embed.addFields({
      name: '🏆 ACHIEVEMENTS',
      value: achievements.join(' • '),
      inline: false
    });
  }

  // Customization info - ONLY show if user has SILV role AND it's their own profile
  if (message.author.id === user.id) {
    if (isSilvMember) {
      // SILV members see full customization commands
      embed.addFields({
        name: '⚙️ SILV CUSTOMIZATION',
        value: 
          '`.profile customize color #HEXCODE`\n' +
          '`.profile customize bio <text>`\n' +
          '`.profile customize banner <text>`\n' +
          '`.profile reset`',
        inline: false
      });
    } else {
      // Non-SILV members see lock message only
      embed.addFields({
        name: '🔒 CUSTOMIZATION LOCKED',
        value: 'Get SILV role to unlock profile customization.',
        inline: false
      });
    }
  }

  embed.setFooter({ 
    text: isSilvMember ? '✨ SILV Member Profile | Fully Customized' : 'Profile | Get SILV to customize' 
  });

  return message.channel.send({ embeds: [embed] });
}
