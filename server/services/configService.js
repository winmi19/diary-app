const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.diary-config.json');

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { storageDir: '' };
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function setConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = { getConfig, setConfig };
