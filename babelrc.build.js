const tag = process.env.NODE_TAG || process.env.NODE_ENV;
const cfg = {
  next: {module: 'esm', targets: {chrome: 70}},
  esm: {module: 'esm', targets: {ie: 11}},
  cjs: {module: 'cjs', targets: {ie: 11}},
  test: {module: 'cjs', targets: {ie: 11}},
};
const env = cfg[tag];

module.exports = (presets = []) => {
  return {
    presets: [['@medux/recommended', {...env, presets, rootImport: {rootPathPrefix: 'src/', rootPathSuffix: './src/'}}]],
    ignore: ['**/*.d.ts'],
    comments: false,
  };
};
