const { EmbedBuilder } = require('discord.js');

// Channel where passive drops happen
const KEYDROP_CHANNEL_ID = '1405349401945178152';

// One active key at a time
let currentKey = null;

// Rarities and relative chances (these are *within* the 5% drop)
const rarities = [
  { name: 'Prismatic', chance: 0.005 },  // 0.5% of key drops
  { name: 'Mythical',  chance: 0.02  },  // 2% of key drops
  { name: 'Legendary', chance: 0.05  },  // 5%
  { name: 'Rare',      chance: 0.15  },  // 15%
  { name: 'Uncommon',  chance: 0.28  },  // 28%
  { name: 'Common',    chance: 0.49  },  // 49.5%
];

function getRandomRarity() {
  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of rarities) {
    cumulative += rarity.chance;
    if (roll <= cumulative) return rarity.name;
  }
  return rarities[rarities.length - 1].name;
}

async function handleKeyDrop(message, client) {
  if (message.author.bot) return;
  if (message.channel.id !== KEYDROP_CHANNEL_ID) return;

  // 5% chance per message for *any* key activity
  const DROP_CHANCE = 0.05;

  // Small chance to expire an unclaimed key (only roll if a key exists)
  if (currentKey && !currentKey.claimed) {
    if (Math.random() <= 0.03) {
      const channel = client.channels.cache.get(currentKey.channelId);
      if (channel) {
        const expireEmbed = new EmbedBuilder()
          .setTitle('🔒 Key Expired')
          .setDescription(`The **${currentKey.rarity}** key expired.`)
          .setColor('Red')
          .setTimestamp();
        channel.send({ embeds: [expireEmbed] });
      }
      currentKey = null;
    }
  }

  // If no active key, 5% chance to spawn one
  if (!currentKey && Math.random() <= DROP_CHANCE) {
    const rarity = getRandomRarity(); // rarity distribution *inside* that 5%
    currentKey = {
      rarity,
      channelId: message.channel.id,
      claimed: false,
      spawnedBy: 'auto',
    };

    const dropEmbed = new EmbedBuilder()
      .setTitle('🔑 Key Dropped!')
      .setDescription(`A **${rarity}** key dropped! Type `.claim` to claim it!`)
      .setColor('Green')
      .setTimestamp();

    await message.channel.send({ embeds: [dropEmbed] });
  }
}

async function spawnKey(rarity, channelId, client) {
  if (currentKey && !currentKey.claimed) {
    return {
      success: false,
      message: 'There is already an active key. Wait until it is claimed or expires.',
    };
  }

  currentKey = {
    rarity,
    channelId,
    claimed: false,
    spawnedBy: 'admin',
  };

  const channel = client.channels.cache.get(channelId);
  if (channel) {
    const dropEmbed = new EmbedBuilder()
      .setTitle('🔑 Admin Key Spawned!')
      .setDescription(`An **${rarity}** key has been spawned! Type `.claim` to claim it!`)
      .setColor('Gold')
      .setTimestamp();

    await channel.send({ embeds: [dropEmbed] });
  }

  return {
    success: true,
    message: `Spawned a **${rarity}** key in <#${channelId}>.`,
  };
}

async function claimKey(userId, addKeyToInventory) {
  if (!currentKey || currentKey.claimed) return false;

  await addKeyToInventory(userId, currentKey.rarity, 1);
  currentKey.claimed = true;
  currentKey = null;
  return true;
}

function getCurrentKey() {
  return currentKey;
}

module.exports = {
  handleKeyDrop,
  spawnKey,
  claimKey,
  getCurrentKey,
  getRandomRarity,
};
