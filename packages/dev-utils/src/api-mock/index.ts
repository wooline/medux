/* eslint-disable no-console */
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';

import {NextFunction, Request, Response} from 'express';

export function createMiddleware(mockFile: string, globalFile?: string) {
  const mockDir = path.dirname(mockFile);
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir);
  }
  if (!fs.existsSync(mockFile)) {
    fs.writeFileSync(mockFile, 'module.exports = {}');
  }
  if (!globalFile) {
    const extname = path.extname(mockFile);
    globalFile = path.join(mockDir, `./global${extname}`);
  }
  console.info(`enable ${chalk.magenta('api mock')} \n api: ${chalk.underline(mockFile)} \n global: ${chalk.underline(globalFile)}`);
  return (req: Request, res: Response, next: NextFunction) => {
    const str = fs
      .readFileSync(mockFile)
      .toString()
      .replace(/^[^{]+/, 'return ')
      .replace(/\b(require|import)\(/g, '(');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const indexMap: {[rule: string]: string} = new Function(str)();
    let mockPath;
    Object.keys(indexMap).some((rule) => {
      const isMatch = new RegExp(rule).test(`${req.method.toLocaleUpperCase()} ${req.originalUrl}`);
      if (isMatch) {
        const extname = path.extname(indexMap[rule]);
        if (extname) {
          if (fs.existsSync(path.join(mockDir, indexMap[rule]))) {
            mockPath = path.join(mockDir, indexMap[rule]);
          }
        } else if (fs.existsSync(path.join(mockDir, `${indexMap[rule]}.js`))) {
          mockPath = path.join(mockDir, `${indexMap[rule]}.js`);
        } else if (fs.existsSync(path.join(mockDir, `${indexMap[rule]}.ts`))) {
          mockPath = path.join(mockDir, `${indexMap[rule]}.ts`);
        }
        return true;
      }
      return false;
    });
    if (mockPath) {
      delete require.cache[globalFile!];
      delete require.cache[mockPath];
      const middleware = require(mockPath);
      if (typeof middleware === 'function') {
        return middleware(req, res, next);
      }
    }
    return next();
  };
}
