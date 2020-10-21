module.exports = {
  extends: ['../../../.eslintrc-src.js'],
  parserOptions: {
    // @ts-ignore
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    'no-restricted-syntax': 'off',
    'no-prototype-builtins': 'off',
    'no-eval': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
  ignorePatterns: [],
};
