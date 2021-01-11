"use strict";
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
module.exports = function createMiddleware(mockDir) {
    const indexFile = path.join(mockDir, 'index.js');
    console.info(`${chalk.magenta('enable api mock file:')} ${chalk.underline(indexFile)}`);
    if (!fs.existsSync(mockDir)) {
        fs.mkdirSync(mockDir);
    }
    if (!fs.existsSync(indexFile)) {
        fs.writeFileSync(indexFile, 'module.exports = {}');
    }
    return (req, res, next) => {
        const str = fs
            .readFileSync(indexFile)
            .toString()
            .replace(/^[^{]+/, 'return ')
            .replace(/\brequire\(/g, '(');
        const indexMap = new Function(str)();
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
        if (mockPath) {
            delete require.cache[mockPath];
            const middleware = require(mockPath);
            if (typeof middleware === 'function') {
                return middleware(req, res, next);
            }
        }
        return next();
    };
};
