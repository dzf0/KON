const { EmbedBuilder } = require('discord.js');

const ADMIN_ROLE_ID = '1439504588318314496'; // Put your admin role ID here

const validRarities = [
  'prismatic', 'mythical', 'legendary', 'rare', 'uncommon', 'common'
];

module.exports = {
  name: 'admin',
  description: 'Admin commands: give/remove keys or currency, reset player stats.',
  async execute({ message, args, data, saveUserData }) {
    // Permission check
    if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Access Denied')
            .setDescription('Only admins can use admin commands.')
        ]
      });
    }

    if (args.length < 1) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFAA00')
            .setTitle('Invalid Usage')
            .setDescription('Commands: give, remove, reset')
        ]
      });
    }

    const subcommand = args[0].toLowerCase();

    if (subcommand === 'give' || subcommand === 'remove') {
      // Format: !admin give|remove currency|keys [rarity] amount @user
      const type = args[1]?.toLowerCase();
      if (!['currency', 'keys'].includes(type)) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Invalid Type')
              .setDescription('Type must be "currency" or "keys".')
          ]
        });
      }

      let rarity = null;
      let amountIndex = 2;
      if (type === 'keys') {
        rarity = args[2]?.toLowerCase();
        amountIndex++;
        if (!rarity || !validRarities.includes(rarity)) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFAA00')
                .setTitle('Invalid Usage')
                .setDescription(`Usage: !admin ${subcommand} keys <rarity> <amount> <@user>`)
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
              .setColor('#FFAA00')
              .setTitle('Invalid Arguments')
              .setDescription(`Usage: !admin ${subcommand} ${type}${type === 'keys' ? ' <rarity>' : ''} <amount> <@user>`)
          ]
        });
      }

      const userId = userMention.id;

      // Defensive user data initialization
      if (!data[userId] || typeof data[userId] !== 'object') data[userId] = { balance: 0, inventory: {} };
      if (!data[userId].inventory || typeof data[userId].inventory !== 'object') data[userId].inventory = {};
      if (typeof data[userId].balance !== 'number') data[userId].balance = 0;

      if (subcommand === 'give') {
        if (type === 'keys') {
          data[userId].inventory[rarity] = (data[userId].inventory[rarity] || 0) + amount;
          saveUserData(data);
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Keys Given')
                .setDescription(`Gave ${amount} ${rarity} key(s) to ${userMention.username}.`)
            ]
          });
        } else {
          data[userId].balance += amount;
          saveUserData(data);
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Currency Added')
                .setDescription(`Added ${amount} 𝓚𝓪𝓷 to ${userMention.username}.`)
            ]
          });
        }
      } else { // remove
        if (type === 'keys') {
          if (!data[userId].inventory[rarity] || data[userId].inventory[rarity] < amount) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('Insufficient Keys')
                  .setDescription(`${userMention.username} does not have enough ${rarity} key(s).`)
              ]
            });
          }
          data[userId].inventory[rarity] -= amount;
          if (data[userId].inventory[rarity] === 0) delete data[userId].inventory[rarity];
          saveUserData(data);
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('Keys Removed')
                .setDescription(`Removed ${amount} ${rarity} key(s) from ${userMention.username}.`)
            ]
          });
        } else { // currency
          if (data[userId].balance < amount) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('Insufficient Currency')
                  .setDescription(`${userMention.username} does not have enough 𝓚𝓪𝓷.`)
              ]
            });
          }
          data[userId].balance -= amount;
          saveUserData(data);
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('Currency Removed')
                .setDescription(`Removed ${amount} 𝓚𝓪𝓷 from ${userMention.username}.`)
            ]
          });
        }
      }
    } else if (subcommand === 'reset') {
      // Usage: !admin reset <userId>
      const userId = args[1];
      if (!userId || !data[userId]) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFAA00')
              .setTitle('Invalid User')
              .setDescription('User data not found or invalid user ID.')
          ]
        });
      }
      delete data[userId];
      saveUserData(data);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('User Data Reset')
            .setDescription(`User data reset for user ID ${userId}.`)
        ]
      });
    } else {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Invalid Command')
            .setDescription('Valid admin commands: give, remove, reset')
        ]
      });
    }
  }
};
