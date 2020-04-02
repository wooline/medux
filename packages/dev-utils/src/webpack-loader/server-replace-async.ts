import path from 'path';

const moduleIndexFile = path.join('src/modules/index');

export = function loader(source: string) {
  if (this.resourcePath.indexOf(moduleIndexFile) > -1) {
    return source.replace(/import\s*\(/gm, 'require(');
  }
  return source;
};
