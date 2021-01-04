type Options = {
  module?: 'cjs' | 'esm';
  targets?: any;
  presets?: any[];
  plugins?: any[];
  moduleResolver?: {root: string[]; alias: {[key: string]: string}};
  rootImport?: any;
  classPropertiesLoose?: boolean;
};
const runtimeVersion = require('@babel/runtime/package.json').version;

module.exports = function (api: any, options: Options = {}) {
  if (process.env.NODE_ENV === 'test' || api.caller((caller: any) => caller && caller.target === 'node')) {
    options.module = 'cjs';
  }
  if (options.module === 'cjs' && !options.targets) {
    options.targets = {node: 'current'};
  }
  const {module = 'esm', targets, presets = ['@babel/preset-react'], moduleResolver, rootImport, plugins = [], classPropertiesLoose = true} = options;
  return {
    sourceType: 'unambiguous',
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules: module === 'cjs' ? 'cjs' : false,
          targets,
        },
      ],
      ...presets,
      '@babel/preset-typescript',
    ].filter(Boolean),
    plugins: [
      rootImport && ['babel-plugin-root-import', rootImport],
      moduleResolver && ['module-resolver', moduleResolver],
      ...plugins,
      '@babel/plugin-syntax-dynamic-import',
      ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
      ['@babel/plugin-proposal-class-properties', {loose: classPropertiesLoose}],
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      ['@babel/plugin-proposal-object-rest-spread', {loose: true, useBuiltIns: true}],
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: module === 'esm',
          version: runtimeVersion,
        },
      ],
    ].filter(Boolean),
  };
};
