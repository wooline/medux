import * as path from 'path';
import * as fs from 'fs';
import * as TJS from 'typescript-json-schema';
import * as chalk from 'chalk';

export function patch(_tsconfig?: string | Object, _entryFilePath?: string, _echo?: boolean) {
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
  const arr = source.match(/patchActions\s*\(([^)]+)\)/m);
  if (arr) {
    const [args1, ...args2] = arr[1].split(',');
    const typeName = args1.trim();
    const json = args2.join(',').trim();
    const files = [entryFilePath];
    console.info(`patchActions using type ${chalk.magenta(`${typeName.substr(1, typeName.length - 2)}`)} for ${chalk.underline(entryFilePath)}`);
    const program = TJS.getProgramFromFiles(files, tsconfig.compilerOptions);
    const defineType = TJS.generateSchema(program, typeName.substr(1, typeName.length - 2), {ignoreErrors: false});
    const properties: any = defineType!.properties!;
    const actions = Object.keys(properties).reduce((obj, key) => {
      obj[key] = properties[key].enum;
      return obj;
    }, {});
    const json2 = `'${JSON.stringify(actions)}'`;
    if (_echo) {
      console.info(json2);
    } else if (json !== json2) {
      const newSource = source.replace(arr[0], `patchActions(${typeName}, ${json2})`);
      fs.writeFileSync(entryFilePath, newSource);
      console.info(`${chalk.underline(entryFilePath)} has been patched!`);
    } else {
      console.info('There was no change!');
    }
  }
}
