const { EmbedBuilder } = require('discord.js');

const ADMIN_ROLE_ID = '1382513369801555988'; // same as in admin.js

module.exports = {
  name: 'testrole',
  description: 'Debug: directly give SILV MEMBER to yourself',
  async execute({ message }) {
    // only admins
    if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#F5E6FF')
            .setTitle('˗ˏˋ 𐙚 𝔸𝕔𝕔𝕖𝕤𝕤 𝔻𝕖𝕟𝕚𝕖𝕕 𐙚 ˎˊ˗')
            .setDescription('Only admins can use this debug command.')
            .setFooter({ text: 'System • Permission Check' })
        ]
      });
    }

    const roleId = '1452178800459645026'; // SILV MEMBER

    const member = await message.guild.members.fetch(message.author.id);
    const role = message.guild.roles.cache.get(roleId);

    console.log('TESTROLE » role =', role && role.id, role && role.name);

    if (!role) {
      return message.reply('Role not found in this server with that ID.');
    }

    try {
      await member.roles.add(role);
      return message.reply('Role added successfully by testrole command.');
    } catch (err) {
      console.error('TESTROLE » add failed:', err);
      return message.reply('Failed to add role (see console).');
    }
  },
};
