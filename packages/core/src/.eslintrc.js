module.exports = {
  extends: ['../../../.eslintrc-src.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    'no-restricted-syntax': 'off',
    'no-prototype-builtins': 'off',
  },
  ignorePatterns: [],
};
