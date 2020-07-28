const fs = require('fs');

let config;

updateConfig = (obj) => config = obj;

updateConfig(JSON.parse(fs.readFileSync('config.json')));

module.exports = {config, updateConfig}