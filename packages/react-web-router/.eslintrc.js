module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['./main.js', '/dist', '/src', '/tests', '/types', '/api'],
};
