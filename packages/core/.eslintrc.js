module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    'no-restricted-syntax': 'off',
    'no-prototype-builtins': 'off',
  },
};
