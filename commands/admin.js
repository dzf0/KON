const { EmbedBuilder } = require('discord.js');

const ADMIN_ROLE_ID = '1382513369801555988'; // Replace with your admin role ID

const validRarities = [
  'Prismatic', 'Mythical', 'Legendary', 'Rare', 'Uncommon', 'Common'
];

// inventory key used by shop & inventory.js
const SILV_TOKEN_KEY = 'Silv token';

function toProperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = {
  name: 'admin',
  description: 'Admin commands: give/remove currency, silv tokens or keys, reset user data, spawn keys.',
  async execute({ message, args, getUserData, keydrop, logAdminAction }) {
    if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#F5E6FF')
            .setTitle('˗ˏˋ 𐙚 𝔸𝕔𝕔𝕖𝕤𝕤 𝔻𝕖𝕟𝕚𝕖𝕕 𐙚 ˎˊ˗')
            .setDescription([
              '꒰ঌ 𝔗𝔥𝔦𝔰 𝔭𝔞𝔫𝔢𝔩 𝔦𝔰 𝔯𝔢𝔰𝔢𝔯𝔳𝔢𝔡 𝔣𝔬𝔯 𝔥𝔦𝔤𝔥𝔢𝔯 𝔞𝔫𝔤𝔢𝔩𝔰 ໒꒱',
              '',
              'Only admins can use admin commands.'
            ].join('\n'))
            .setFooter({ text: 'System • Permission Check' })
        ]
      });
    }

    if (args.length < 1) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#F5E6FF')
            .setTitle('✧˚₊‧ 𝕀𝕟𝕧𝕒𝕝𝕚𝕕 𝕌𝕤𝕒𝕘𝕖 ‧₊˚✧')
            .setDescription([
              '꒰ঌ 𝔄𝔡𝔪𝔦𝔫 𝔓𝔞𝔫𝔢𝔩 ໒꒱',
              '',
              'Valid commands: give, remove, reset, spawn'
            ].join('\n'))
            .setFooter({ text: 'System • Admin Help' })
        ]
      });
    }

    const subcommand = args[0].toLowerCase();

    // ===== GIVE / REMOVE =====
    if (subcommand === 'give' || subcommand === 'remove') {
      const type = args[1]?.toLowerCase();
      // ✧ changed: allow "silv" as a type
      if (!['currency', 'keys', 'silv'].includes(type)) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#F5E6FF')
              .setTitle('✧˚₊‧ 𝕀𝕟𝕧𝕒𝕝𝕚𝕕 𝕋𝕪𝕡𝕖 ‧₊˚✧')
              .setDescription('Type must be "currency", "silv" or "keys".')
              .setFooter({ text: 'System • Argument Error' })
          ]
        });
      }

      let rarityKey = null;
      let amountIndex = 2;

      if (type === 'keys') {
        const rarityArg = args[2];
        rarityKey = toProperCase(rarityArg);
        amountIndex++;
        if (!validRarities.includes(rarityKey)) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ 𝕀𝕟𝕧𝕒𝕝𝕚𝕕 ℝ𝕒𝕣𝕚𝕥𝕪 ‧₊˚✧')
                .setDescription(`Valid rarities: ${validRarities.join(', ')}`)
                .setFooter({ text: 'System • Rarity List' })
            ]
          });
        }
      }

      const amount = parseInt(args[amountIndex]);
      const userMention = message.mentions.users.first();

      if (!userMention || isNaN(amount) || amount <= 0) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#F5E6FF')
              .setTitle('✧˚₊‧ 𝕀𝕟𝕧𝕒𝕝𝕚𝕕 𝔸𝕣𝕘𝕦𝕞𝕖𝕟𝕥𝕤 ‧₊˚✧')
              .setDescription(
                `Usage: .admin ${subcommand} ${type}${type === 'keys' ? ' <rarity>' : ''} <amount> <@user>`
              )
              .setFooter({ text: 'System • Usage Hint' })
          ]
        });
      }

      const userId = userMention.id;
      const targetData = await getUserData(userId);
      const User = require('mongoose').model('User');

      if (subcommand === 'give') {
        if (type === 'keys') {
          // keys (unchanged)
          targetData.inventory = targetData.inventory || {};
          targetData.inventory[rarityKey] = (targetData.inventory[rarityKey] || 0) + amount;
          await User.updateOne({ userId }, { $set: { inventory: targetData.inventory } }, { upsert: true });

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Give Keys',
            userId,
            userMention.username,
            `${amount}x ${rarityKey}`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ 𝕂𝕖𝕪𝕤 𝔾𝕚𝕧𝕖𝕟 ‧₊˚✧')
                .setDescription(
                  [
                    `Gave ${amount} ${rarityKey} key(s) to ${userMention.username}.`,
                    '',
                    '˗ˏˋ 𐙚 𝔦𝔫𝔳𝔢𝔫𝔱𝔬𝔯𝔶 𝔥𝔞𝔰 𝔟𝔢𝔢𝔫 𝔟𝔩𝔢𝔰𝔰𝔢𝔡 𐙚 ˎˊ˗'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        } else if (type === 'silv') {
          // ✧ NEW: give Silv tokens
          targetData.inventory = targetData.inventory || {};
          targetData.inventory[SILV_TOKEN_KEY] =
            (targetData.inventory[SILV_TOKEN_KEY] || 0) + amount;

          await User.updateOne(
            { userId },
            { $set: { inventory: targetData.inventory } },
            { upsert: true }
          );

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Give Silv',
            userId,
            userMention.username,
            `${amount} Silv token(s)`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ 𝕊𝕚𝕝𝕧 𝕋𝕠𝕜𝕖𝕟𝕤 𝔾𝕚𝕧𝕖𝕟 ‧₊˚✧')
                .setDescription(
                  [
                    `Gave ${amount} **Silv token(s)** to ${userMention.username}.`,
                    '',
                    'ෆ 𝔠𝔢𝔩𝔢𝔰𝔱𝔦𝔞𝔩 𝔰𝔦𝔩𝔳 𝔣𝔩𝔬𝔴𝔰 𝔱𝔬 𝔱𝔥𝔢𝔦𝔯 𝔦𝔫𝔳𝔢𝔫𝔱𝔬𝔯𝔶 ෆ'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        } else {
          // currency (unchanged)
          targetData.balance = (targetData.balance || 0) + amount;
          await User.updateOne({ userId }, { $set: { balance: targetData.balance } }, { upsert: true });

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Give Currency',
            userId,
            userMention.username,
            `${amount} coins`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ ℂ𝕦𝕣𝕣𝕖𝕟𝕔𝕪 𝔸𝕕𝕕𝕖𝕕 ‧₊˚✧')
                .setDescription(
                  [
                    `Added ${amount} coins to ${userMention.username}.`,
                    '',
                    'ෆ 𝔟𝔞𝔩𝔞𝔫𝔠𝔢 𝔟𝔩𝔢𝔰𝔰𝔢𝔡 𝔟𝔶 𝔥𝔦𝔤𝔥𝔢𝔯 𝔟𝔢𝔦𝔫𝔤𝔰 ෆ'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        }
      } else {
        // ===== REMOVE =====
        if (type === 'keys') {
          // keys (unchanged)
          targetData.inventory = targetData.inventory || {};
          if (!targetData.inventory[rarityKey] || targetData.inventory[rarityKey] < amount) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#F5E6FF')
                  .setTitle('✧˚₊‧ 𝕀𝕟𝕤𝕦𝕗𝕗𝕚𝕔𝕚𝕖𝕟𝕥 𝕂𝕖𝕪𝕤 ‧₊˚✧')
                  .setDescription(`${userMention.username} does not have enough ${rarityKey} key(s).`)
                  .setFooter({ text: 'System • Inventory Check' })
              ]
            });
          }
          targetData.inventory[rarityKey] -= amount;
          if (targetData.inventory[rarityKey] === 0) delete targetData.inventory[rarityKey];
          await User.updateOne({ userId }, { $set: { inventory: targetData.inventory } }, { upsert: true });

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Remove Keys',
            userId,
            userMention.username,
            `${amount}x ${rarityKey}`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ 𝕂𝕖𝕪𝕤 ℝ𝕖𝕞𝕠𝕧𝕖𝕕 ‧₊˚✧')
                .setDescription(
                  [
                    `Removed ${amount} ${rarityKey} key(s) from ${userMention.username}.`,
                    '',
                    '⋆｡˚ ✩ 𝔠𝔢𝔩𝔢𝔰𝔱𝔦𝔞𝔩 𝔯𝔢𝔠𝔬𝔯𝔡𝔰 𝔞𝔡𝔧𝔲𝔰𝔱𝔢𝔡 ✩ ˚｡⋆'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        } else if (type === 'silv') {
          // ✧ NEW: remove Silv tokens
          targetData.inventory = targetData.inventory || {};
          const currentSilv = targetData.inventory[SILV_TOKEN_KEY] || 0;
          if (currentSilv < amount) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#F5E6FF')
                  .setTitle('✧˚₊‧ 𝕀𝕟𝕤𝕦𝕗𝕗𝕚𝕔𝕚𝕖𝕟𝕥 𝕊𝕚𝕝𝕧 ‧₊˚✧')
                  .setDescription(`${userMention.username} does not have enough Silv tokens.`)
                  .setFooter({ text: 'System • Inventory Check' })
              ]
            });
          }

          targetData.inventory[SILV_TOKEN_KEY] = currentSilv - amount;
          if (targetData.inventory[SILV_TOKEN_KEY] === 0) {
            delete targetData.inventory[SILV_TOKEN_KEY];
          }

          await User.updateOne(
            { userId },
            { $set: { inventory: targetData.inventory } },
            { upsert: true }
          );

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Remove Silv',
            userId,
            userMention.username,
            `${amount} Silv token(s)`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ 𝕊𝕚𝕝𝕧 𝕋𝕠𝕜𝕖𝕟𝕤 ℝ𝕖𝕞𝕠𝕧𝕖𝕕 ‧₊˚✧')
                .setDescription(
                  [
                    `Removed ${amount} **Silv token(s)** from ${userMention.username}.`,
                    '',
                    '₊˚ෆ 𝔠𝔢𝔩𝔢𝔰𝔱𝔦𝔞𝔩 𝔩𝔢𝔡𝔤𝔢𝔯 𝔲𝔭𝔡𝔞𝔱𝔢𝔡 ෆ˚₊'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        } else {
          // currency (unchanged)
          if (targetData.balance < amount) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#F5E6FF')
                  .setTitle('✧˚₊‧ 𝕀𝕟𝕤𝕦𝕗𝕗𝕚𝕔𝕚𝕖𝕟𝕥 ℂ𝕦𝕣𝕣𝕖𝕟𝕔𝕪 ‧₊˚✧')
                  .setDescription(`${userMention.username} does not have enough coins.`)
                  .setFooter({ text: 'System • Balance Check' })
              ]
            });
          }
          targetData.balance -= amount;
          await User.updateOne({ userId }, { $set: { balance: targetData.balance } }, { upsert: true });

          await logAdminAction(
            message.author.id,
            message.author.username,
            'admin',
            'Remove Currency',
            userId,
            userMention.username,
            `${amount} coins`
          );

          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#F5E6FF')
                .setTitle('✧˚₊‧ ℂ𝕦𝕣𝕣𝕖𝕟𝕔𝕪 ℝ𝕖𝕞𝕠𝕧𝕖𝕕 ‧₊˚✧')
                .setDescription(
                  [
                    `Removed ${amount} coins from ${userMention.username}.`,
                    '',
                    '₊˚ෆ 𝔠𝔢𝔩𝔢𝔰𝔱𝔦𝔞𝔩 𝔩𝔢𝔡𝔤𝔢𝔯 𝔲𝔭𝔡𝔞𝔱𝔢𝔡 ෆ˚₊'
                  ].join('\n')
                )
                .setFooter({ text: 'System • Admin Action Logged' })
            ]
          });
        }
      }
    }

    // ===== RESET / SPAWN / FALLBACK =====
    // (leave the rest of your file unchanged)
  }
};
