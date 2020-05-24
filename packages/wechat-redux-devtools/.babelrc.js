const build = require('../../babelrc.build');
const config = build();
module.exports = config;

// module.exports = {
//   presets: [
//     [
//       '@babel/preset-env',
//       {
//         loose: true,
//         modules: false,
//         targets: {chrome: 60},
//       },
//     ],
//   ],
//   plugins: [
//     ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
//     ['@babel/plugin-proposal-class-properties', {loose: true}],
//     '@babel/plugin-proposal-nullish-coalescing-operator',
//     '@babel/plugin-proposal-optional-chaining',
//     ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true}],
//     [
//       '@babel/plugin-transform-runtime',
//       {
//         useESModules: false,
//         version: '^7.7.2',
//       },
//     ],
//   ],
//   ignore: ['**/__tests__/**'],
//   comments: false,
// };
