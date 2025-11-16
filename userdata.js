const fs = require('fs');
const dataFile = './data.json';

// Load user data from file or return empty object
function loadUserData() {
  try {
    const raw = fs.readFileSync(dataFile);
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

// Save user data object to file
function saveUserData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Get user's current balance, or 0 if none
function getUserBalance(userId, data) {
  return data[userId] ? data[userId].balance : 0;
}

// Add Kan to user's balance and save immediately
function addKanToUser(userId, amount, data) {
  if (!data[userId]) {
    data[userId] = { balance: 0 };
  }
  data[userId].balance += amount;
  saveUserData(data);
}

module.exports = { loadUserData, saveUserData, getUserBalance, addKanToUser };
