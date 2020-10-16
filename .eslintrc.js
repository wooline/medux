module.exports = {
  extends: ['plugin:@medux/recommended/react'],
  parserOptions: {
    project: './packages/**/tsconfig.json',
  },
  rules: {
    'global-require': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off'
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      env: {
        es6: true,
        browser: true,
        node: false,
      },
      rules: {},
    },
  ],
};
