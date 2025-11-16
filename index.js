require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running');
});

app.listen(PORT, () => {
  console.log(`Web server started on port ${PORT}`);
});
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const userData = require('./userData');
const guessCommand = require('./commands/guess'); // Import guess command module

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const prefix = '!';

// Admin Role ID for guess game permission
const ADMIN_ROLE_ID = 'YOUR_ADMIN_ROLE_ID_HERE';

// Load commands dynamically
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
}

// Default rarities for keys in general
const rarities = [
  { name: 'Prismatic', chance: 0.001, minKan: 1000, maxKan: 2000 },
  { name: 'Mythical', chance: 0.01, minKan: 500, maxKan: 999 },
  { name: 'Legendary', chance: 0.05, minKan: 200, maxKan: 499 },
  { name: 'Rare', chance: 0.15, minKan: 100, maxKan: 199 },
  { name: 'Uncommon', chance: 0.30, minKan: 50, maxKan: 99 },
  { name: 'Common', chance: 0.50, minKan: 10, maxKan: 49 },
];

let data = userData.loadUserData();

let currentKey = { value: null };
let keyClaimed = { value: false };

// Guess game state
let guessGame = {
  active: false,
  number: null,
  channelId: null,
};

function getRandomRarity(raritiesArray) {
  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of raritiesArray) {
    cumulative += rarity.chance;
    if (roll <= cumulative) return rarity;
  }
  return raritiesArray[raritiesArray.length - 1];
}

function addKeyToInventory(userId, rarityName, amount) {
  if (!data[userId]) data[userId] = { balance: 0, inventory: {} };
  if (!data[userId].inventory) data[userId].inventory = {};
  if (!data[userId].inventory[rarityName]) data[userId].inventory[rarityName] = 0;
  data[userId].inventory[rarityName] += amount;
  userData.saveUserData(data);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Expire old unclaimed key on new spawn chance
  if (currentKey.value && !keyClaimed.value) {
    if (Math.random() <= 0.05) {
      const oldChannel = client.channels.cache.get(currentKey.value.channelId);
      if (oldChannel) {
        const expireEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Key Expired')
          .setDescription(`The **${currentKey.value.rarity}** key has expired as a new key has dropped.`);
        oldChannel.send({ embeds: [expireEmbed] });
      }
      currentKey.value = null;
      keyClaimed.value = false;
    }
  }

  // Drop new key if none active
  if (!currentKey.value && Math.random() <= 0.05) {
    const rarity = getRandomRarity(rarities);
    currentKey.value = {
      rarity: rarity.name,
      channelId: message.channel.id,
      claimerId: null,
    };
    keyClaimed.value = false;
    const dropEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Key Dropped')
      .setDescription(`A **${rarity.name}** key has dropped! Type \`!claim\` to claim the key!`);
    message.channel.send({ embeds: [dropEmbed] });
  }

  // Guessing game: listen for guesses typed in chat
  if (guessGame.active && message.channel.id === guessGame.channelId) {
    const guess = parseInt(message.content);
    if (!isNaN(guess)) {
      if (guess === guessGame.number) {
        // Use the higher rarity chances from the guessCommand module
        const wonRarity = guessCommand.getRandomRarity(guessCommand.guessGameRarities);
        addKeyToInventory(message.author.id, wonRarity.name, 1);
        userData.saveUserData(data);
        const winEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Guessing Game Winner!')
          .setDescription(`${message.author} guessed the correct number **${guessGame.number}** and won a **${wonRarity.name}** key!`);
        message.channel.send({ embeds: [winEmbed] });
        guessGame.active = false;
      }
      // No messages on wrong guesses
      return;
    }
  }

  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute({
      message,
      args,
      data,
      userData,
      currentKey,
      keyClaimed,
      rarities,
      prefix,
      saveUserData: userData.saveUserData,
      addKeyToInventory,
      guessGame,
      ADMIN_ROLE_ID,
    });
  } catch (error) {
    console.error('Error executing command:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Command Error')
      .setDescription('There was an error executing that command.');
    message.channel.send({ embeds: [errorEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
