const { off } = require("process");

module.exports = {
  root: true,
  extends: ['plugin:@medux/recommended/common'],
  env: {
    browser: false,
    node: false,
  },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    'import/prefer-default-export': 'off',
  },
};
