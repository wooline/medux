module.exports = {
  env: {
    es6: true,
    browser: false,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint', // 屏蔽eslint
    'plugin:prettier/recommended', // 转eslint
    'prettier/babel',
  ],
  plugins: [],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-template-curly-in-string': 'off',
    'max-classes-per-file': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'prefer-destructuring': 'off',
    'prefer-promise-reject-errors': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      env: {
        es6: true,
        browser: true,
        node: false,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
