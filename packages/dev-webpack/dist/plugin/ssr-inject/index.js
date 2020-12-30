"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSsrInjectPlugin = exports.SsrInject = void 0;
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const webpack = require("webpack");
const unionfs_1 = require("unionfs");
const fs_monkey_1 = require("fs-monkey");
const schema_utils_1 = require("schema-utils");
const schema = {
    type: 'object',
    properties: {
        entryFileName: {
            type: 'string',
        },
    },
    additionalProperties: false,
};
function replace(source, htmlKey, html) {
    return source.replace(htmlKey, html);
}
class SsrInject {
    constructor(options = {}) {
        this.entryFilePath = '';
        this.htmlKey = 'process.env.MEDUX_ENV_SSRTPL';
        this.html = '';
        schema_utils_1.validate(schema, options, { name: '@medux/dev-webpack/ssr-inject' });
        this.entryFileName = options.entryFileName || 'main.js';
    }
    apply(compiler) {
        const htmlKey = this.htmlKey;
        if (compiler.options.name === 'server') {
            const entryFileName = this.entryFileName;
            const outputPath = compiler.options.output.path;
            this.entryFilePath = path.join(outputPath, entryFileName);
            compiler.hooks.compilation.tap('SsrInject', (compilation) => {
                compilation.hooks.afterProcessAssets.tap('SsrInjectReplace', (assets) => {
                    const html = this.html;
                    if (assets[entryFileName] && html) {
                        compilation.updateAsset(entryFileName, (source) => {
                            return new webpack.sources.RawSource(replace(source.source().toString(), htmlKey, html), false);
                        });
                    }
                });
            });
            compiler.hooks.emit.tapAsync('SsrInjectDeleteCache', (compilation, callback) => {
                const hotJsonFile = Object.keys(compilation.assets).find((name) => name.endsWith('.hot-update.json'));
                if (hotJsonFile) {
                    const manifest = JSON.parse(compilation.assets[hotJsonFile].source().toString());
                    const keys = [...manifest.c, ...manifest.r, ...manifest.m];
                    keys.forEach((item) => {
                        const mpath = path.join(outputPath, `${item}.js`);
                        delete require.cache[mpath];
                    });
                }
                callback();
            });
        }
        else {
            compiler.hooks.compilation.tap('SsrInject', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('SsrInjectSetHtml', (data, callback) => {
                    const outputFileSystem = compiler.outputFileSystem;
                    const html = Buffer.from(data.html).toString('base64');
                    const rawHtml = this.html || htmlKey;
                    this.html = html;
                    const entryFilePath = this.entryFilePath;
                    if (outputFileSystem.existsSync(entryFilePath)) {
                        const source = outputFileSystem.readFileSync(entryFilePath).toString();
                        outputFileSystem.writeFileSync(entryFilePath, replace(source, rawHtml, html));
                        delete require.cache[entryFilePath];
                    }
                    callback(null, data);
                });
            });
        }
    }
    getEntryPath(res) {
        if (!this.outputFileSystem) {
            const { outputFileSystem } = res.locals.webpack.devMiddleware;
            unionfs_1.ufs.use(fs).use(outputFileSystem);
            fs_monkey_1.patchRequire(unionfs_1.ufs);
            this.outputFileSystem = unionfs_1.ufs;
        }
        return this.entryFilePath;
    }
}
exports.SsrInject = SsrInject;
let instance = null;
function getSsrInjectPlugin(entryFileName = 'main.js') {
    if (!instance) {
        instance = new SsrInject({ entryFileName });
    }
    return instance;
}
exports.getSsrInjectPlugin = getSsrInjectPlugin;
