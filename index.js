require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Express server setup for Render 24/7 uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`Web server started on port ${PORT}`));

// Create Discord client with intents for messages and guilds
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load command files dynamically from ./commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name && command.execute) {
    client.commands.set(command.name, command);
  } else {
    console.log(`[WARNING] Command file ${file} missing name or execute property.`);
  }
}

// Simple in-memory user data object for demo (replace with persistent storage)
const userData = {};
function saveUserData() {
  // Implement file or database saving here if needed
  // For example: fs.writeFileSync('userData.json', JSON.stringify(userData));
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Command prefix
const prefix = '!';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute({
      message,
      args,
      client,
      data: userData,
      saveUserData,
    });
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command.');
  }
});

client.login(process.env.DISCORD_TOKEN);
