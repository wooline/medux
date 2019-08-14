const env = process.env.NODE_ENV;
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: env === 'cjs' ? 'cjs' : false,
        targets: env === 'cjs' ? {ie: '11'} : {esmodules: true},
      },
    ],
    '@babel/preset-typescript',
  ].filter(Boolean),
  plugins: [
    //'@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: env === 'cjs' ? false : true,
      },
    ],
  ].filter(Boolean),
  ignore: ['**/*.d.ts'],
};
