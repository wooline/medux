module.exports = {
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',  // Allows for the use of imports
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-parameter-properties": "off",
    }
};




/*
"babel-eslint": "10.0.1",
      "babel-preset-react-app": "^8.0.0",
      "eslint": "^5.16.0",
      "eslint-config-react-app": "^4.0.0",
      "eslint-loader": "2.1.2",
      "eslint-plugin-flowtype": "2.50.1",
      "eslint-plugin-import": "2.16.0",
      "eslint-plugin-jsx-a11y": "6.2.1",
      "eslint-plugin-react-hooks": "^1.5.0",
*/
