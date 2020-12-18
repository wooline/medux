module.exports = {
  extends: ['../../../.eslintrc-src.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['/dist', '/src', '/tests', '/types', '/api'],
};
