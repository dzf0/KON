require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`Web server started on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) : [];
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name && command.execute) {
    client.commands.set(command.name, command);
  }
}

const prefix = '!';

// Dummy in-memory user data storage for keys
const userData = {};
function saveUserData() {
  // Optionally save to a file here
}

// Key rarity chances weighted
const rarities = [
  { name: 'prismatic', chance: 0.001 }, // 0.1%
  { name: 'mythical', chance: 0.01 },   // 1%
  { name: 'legendary', chance: 0.05 },  // 5%
  { name: 'rare', chance: 0.15 },       // 15%
  { name: 'uncommon', chance: 0.30 },   // 30%
  { name: 'common', chance: 0.60 },     // 60%
];

// Function to get key rarity on drop
function getRandomKeyDrop() {
  if (Math.random() > 0.05) return null; // 5% chance per message

  const rarityRoll = Math.random();
  let cumulative = 0;
  for (const rarity of rarities) {
    cumulative += rarity.chance;
    if (rarityRoll <= cumulative) {
      return rarity.name;
    }
  }
  return 'common'; // fallback
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Random key drop check
  const drop = getRandomKeyDrop();
  if (drop) {
    const userId = message.author.id;
    userData[userId] = userData[userId] || {};
    userData[userId][drop] = (userData[userId][drop] || 0) + 1;
    saveUserData();

    message.channel.send(`${message.author} just got a **${drop}** key drop! 🎉`);
  }

  if (message.content.startsWith(prefix)) {
    // Command handler
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute({ message, args, client, data: userData, saveUserData });
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      message.reply('There was an error trying to execute that command.');
    }
  } else {
    // Passive guessing game listener
    const guessCommand = client.commands.get('guess');
    if (guessCommand && guessCommand.listen) {
      guessCommand.listen(message, userData, saveUserData);
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);
  