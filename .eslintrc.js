module.exports = {
  env: {
    // browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    // Promise: true,
    global: true,
    console: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier/react',
    'prettier/@typescript-eslint', //屏蔽eslint
    'plugin:prettier/recommended', //转eslint
  ],
  plugins: ['@typescript-eslint', 'prettier', 'react-hooks', 'react'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-undef': 'error',
    'sort-imports': 'off',
    'react/prop-types': 'off',
    'prefer-rest-params': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.js'],
      env: {
        browser: false,
        node: true,
      },
    },
  ],
};
