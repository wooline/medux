module.exports = {
  root: true,
  extends: ['plugin:@medux/recommended/common'],
  env: {
    browser: false,
    node: false,
  },
  rules: {
    'prefer-object-spread': 'off',
    'import/prefer-default-export': 'off',
  },
};
