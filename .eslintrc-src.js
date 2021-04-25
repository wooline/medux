module.exports = {
  root: true,
  extends: ['plugin:@medux/recommended/common'],
  env: {
    browser: false,
    node: false,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", {"args": "none"}]
  },
};
