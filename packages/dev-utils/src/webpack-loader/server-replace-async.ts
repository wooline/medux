import loaderUtils from 'loader-utils';
import path from 'path';
import {validate} from 'schema-utils';

const optionsType = {
  type: 'object',
  properties: {
    modules: {
      type: 'array',
    },
  },
};
const moduleIndexFile = path.join('src/modules/config');

export = function loader(source: string) {
  if (this.resourcePath.indexOf(moduleIndexFile) > -1) {
    const options = loaderUtils.getOptions(this);
    if (options && options.modules) {
      validate(optionsType, options, 'server-replace-async');
      const str = `(\\b(${options.modules.join('|')})\\b[^,]+?)import\\s*\\(`;
      const reg = new RegExp(str, 'gm');
      return source.replace(reg, '$1require(');
    }
    return source.replace(/import\s*\(/gm, 'require(');
  }
  return source;
};
