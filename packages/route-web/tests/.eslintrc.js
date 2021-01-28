module.exports = {
  extends: ['../../../.eslintrc-src.js'],
  parserOptions: {
    // @ts-ignore
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    'no-console': 'off',
  },
  ignorePatterns: [],
};
