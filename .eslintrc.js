module.exports = {
   env: {
      browser: true,
      node: false,
   },
   globals: {
      Promise: true,
   },
   parser: '@typescript-eslint/parser',
   extends: [
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier/@typescript-eslint', //屏蔽eslint
      'plugin:prettier/recommended', //转eslint
      'prettier/react',
   ],
   plugins: ['@typescript-eslint/eslint-plugin'],
   parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
   },
   rules: {
      'no-undef': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
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