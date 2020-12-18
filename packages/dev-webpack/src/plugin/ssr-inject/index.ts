import * as path from 'path';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import {ConcatSource} from 'webpack-sources';
import {Compiler} from 'webpack';
import {validate} from 'schema-utils';

const schema: any = {
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

function replace(source: string, htmlKey: string, html: string) {
  return source.replace(htmlKey, html);
}

interface Options {
  entryFileName?: string;
  htmlKey?: string;
}

module.exports = class SsrInject {
  entryFileName: string;

  entryFilePath: string = '';

  htmlKey: string;

  html: string = '';

  constructor(options: Options = {}) {
    validate(schema, options, {name: '@medux/dev-webpack/ssr-inject'});
    this.entryFileName = options.entryFileName || 'main.js';
    this.htmlKey = options.htmlKey || '';
  }

  // replace(compilation: any, htmlPluginData: any, callback: (ctx: any, data: any) => void) {
  //   const {file, key} = this;
  //   const assets = compilation.assets;
  //   const keys = Object.keys(assets);
  //   const mainFileName = keys.find((name) => file === name);
  //   if (mainFileName) {
  //     compilation.updateAsset(mainFileName, (source: string) => {
  //       return new ConcatSource(source.replace(new RegExp(`['"]${key}['"]`), JSON.stringify(htmlPluginData.html)));
  //     });
  //   }
  //   callback(null, htmlPluginData);
  // }

  apply(compiler: Compiler) {
    const htmlKey = this.htmlKey;
    if (compiler.options.name === 'server') {
      const entryFileName = this.entryFileName;
      const outputPath: string = compiler.options.output.path as string;
      this.entryFilePath = path.join(outputPath, entryFileName);
      compiler.hooks.compilation.tap('SsrInject', (compilation) => {
        compilation.hooks.afterProcessAssets.tap('SsrInjectReplace', (assets) => {
          const html = this.html;
          if (assets[entryFileName] && html) {
            compilation.updateAsset(entryFileName, (source) => {
              return new ConcatSource(replace(source.source().toString(), htmlKey, html));
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
    } else {
      compiler.hooks.compilation.tap('SsrInject', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('SsrInjectSetHtml', (data, callback) => {
          const html = Buffer.from(data.html).toString('base64');
          this.html = html;
          const outputFileSystem = compiler.outputFileSystem as any;
          const entryFilePath = this.entryFilePath;
          if (outputFileSystem.existsSync(entryFilePath)) {
            const source: string = outputFileSystem.readFileSync(entryFilePath).toString();
            outputFileSystem.writeFileSync(entryFilePath, replace(source, htmlKey, html));
            delete require.cache[entryFilePath];
          }
          callback(null, data);
        });
      });
    }
  }
};
