const runtimeVersion = require('@babel/runtime/package.json').version;
module.exports = function (api, options = {}) {
    if (process.env.NODE_ENV === 'test') {
        options.module = 'cjs';
        options.targets = { node: 'current' };
    }
    if (options.module === 'cjs' && !options.targets) {
        options.targets = { node: 'current' };
    }
    const { module = 'esm', targets, presets = ['@babel/preset-react'], moduleResolver, rootImport, plugins = [] } = options;
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
            ['@babel/plugin-proposal-decorators', { legacy: false, decoratorsBeforeExport: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',
            ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
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
