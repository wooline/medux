const tag = process.env.NODE_TAG || process.env.NODE_ENV;
const cfg = {
  next: {code: tag, targets: {chrome: 80}},
  esm: {code: tag, targets: {ie: 11}},
  cjs: {code: tag, targets: {ie: 11}},
  pkg: {code: tag, targets: {ie: 11}},
  test: {code: tag, targets: {ie: 11}},
};
const env = cfg[tag];

module.exports = function (features = []) {
  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules: env.code === 'cjs' || env.code === 'test' ? 'cjs' : false,
          targets: env.targets,
        },
      ],
      ...features,
      '@babel/preset-typescript',
    ].filter(Boolean),
    plugins: [
      //'@babel/plugin-syntax-dynamic-import',
      ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
      ['@babel/plugin-proposal-class-properties', {loose: true}],
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true}],
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: env.code !== 'cjs' && env.code !== 'test',
          version: '^7.7.2',
        },
      ],
    ],
    ignore: ['**/*.d.ts', env.code !== 'test' && '**/__tests__/**'].filter(Boolean),
    comments: false,
  };
  return config;
};
