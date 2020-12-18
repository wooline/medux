"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack_sources_1 = require("webpack-sources");
const schema_utils_1 = require("schema-utils");
const schema = {
    type: 'object',
    properties: {
        entryFileName: {
            type: 'string',
        },
        htmlKey: {
            type: 'string',
        },
    },
    additionalProperties: false,
};
function replace(source, htmlKey, html) {
    return source.replace(htmlKey, html);
}
module.exports = class SsrInject {
    constructor(options = {}) {
        this.entryFilePath = '';
        this.html = '';
        schema_utils_1.validate(schema, options, { name: '@medux/dev-webpack/ssr-inject' });
        this.entryFileName = options.entryFileName || 'main.js';
        this.htmlKey = options.htmlKey || '';
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
                            return new webpack_sources_1.ConcatSource(replace(source.source().toString(), htmlKey, html));
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
                    const html = Buffer.from(data.html).toString('base64');
                    this.html = html;
                    const outputFileSystem = compiler.outputFileSystem;
                    const entryFilePath = this.entryFilePath;
                    if (outputFileSystem.existsSync(entryFilePath)) {
                        const source = outputFileSystem.readFileSync(entryFilePath).toString();
                        outputFileSystem.writeFileSync(entryFilePath, replace(source, htmlKey, html));
                        delete require.cache[entryFilePath];
                    }
                    callback(null, data);
                });
            });
        }
    }
};
