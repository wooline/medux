import * as path from 'path';
import * as fs from 'fs';
import * as TJS from 'typescript-json-schema';

export function patch(_tsconfig?: string | Object, _entryFilePath?: string) {
  const RootPath = process.cwd();
  let tsconfig;
  if (!_tsconfig) {
    tsconfig = require(path.join(RootPath, './tsconfig.json'));
  } else if (typeof _tsconfig === 'string') {
    tsconfig = require(_tsconfig);
  } else {
    tsconfig = _tsconfig;
  }
  const srcPath = path.join(RootPath, 'src');
  const entryFilePath = _entryFilePath || (fs.existsSync(path.join(srcPath, 'Global.ts')) ? path.join(srcPath, 'Global.ts') : path.join(srcPath, 'Global.tsx'));
  const source = fs.readFileSync(entryFilePath).toString();
  const arr = source.match(/proxyPollyfill\s*\(([^)]+)\)/m);
  if (arr) {
    const [args1, ...args2] = arr[1].split(',');
    const typeName = args1.trim();
    const json = args2.join(',').trim();
    const files = [entryFilePath];
    const program = TJS.getProgramFromFiles(files, tsconfig.compilerOptions);
    const actions = TJS.generateSchema(program, typeName, {ignoreErrors: false});
    const json2 = `'${JSON.stringify(actions)}'`;
    if (json !== json2) {
      const newSource = source.replace(arr[0], `proxyPollyfill(${typeName}, ${json2})`);
      fs.writeFileSync(entryFilePath, newSource);
    }
  }
}
