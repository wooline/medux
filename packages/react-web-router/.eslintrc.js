module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['/main.js','/index.js', '/dist', '/src', '/tests', '/types', '/api'],
};
