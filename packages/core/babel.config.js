module.exports = {
  presets: [
    [
      '@babel/env',
      {
        include: ['es6.promise'],
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
  ignore: ['**/*.d.ts'],
  env: {
    production: {
      presets: ['minify'],
    },
  },
};
