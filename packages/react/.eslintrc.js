const config = require('../../.eslintrc.js');

config.parserOptions.project = `${__dirname}/tsconfig.json`;
module.exports = config;
