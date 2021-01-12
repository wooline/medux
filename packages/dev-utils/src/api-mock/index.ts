import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';

import {NextFunction, Request, Response} from 'express';

export = function createMiddleware(mockDir: string) {
  const indexFile = path.join(mockDir, 'index.js');
  console.info(`${chalk.magenta('enable api mock file:')} ${chalk.underline(indexFile)}`);
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir);
  }
  if (!fs.existsSync(indexFile)) {
    fs.writeFileSync(indexFile, 'module.exports = {}');
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const str = fs
      .readFileSync(indexFile)
      .toString()
      .replace(/^[^{]+/, 'return ')
      .replace(/\brequire\(/g, '(');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const indexMap: {[rule: string]: string} = new Function(str)();
    let mockPath;
    Object.keys(indexMap).some((rule) => {
      const isMatch = new RegExp(rule).test(req.originalUrl);
      if (isMatch) {
        const extname = path.extname(indexMap[rule]);
        mockPath = extname ? path.join(mockDir, indexMap[rule]) : path.join(mockDir, `${indexMap[rule]}.js`);
        return true;
      }
      return false;
    });
    if (mockPath && fs.existsSync(mockPath)) {
      delete require.cache[mockPath];
      const middleware = require(mockPath);
      if (typeof middleware === 'function') {
        return middleware(req, res, next);
      }
    }
    return next();
  };
};
