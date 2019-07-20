const env = process.env.NODE_ENV;
module.exports = {
  presets: [
    env === 'production' && 'minify',
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        targets: {
          esmodules:true,
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ].filter(Boolean),
  plugins: [
    ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
      },
    ],
  ].filter(Boolean),
  ignore: ['**/*.d.ts'],
};
