module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['/dist', '/src', '/tests', '/types', '/typings'],
};
