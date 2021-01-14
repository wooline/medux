"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = void 0;
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
function createMiddleware(mockFile) {
    console.info(`enable ${chalk.magenta('api mock')} file: ${chalk.underline(mockFile)}`);
    const mockDir = path.dirname(mockFile);
    if (!fs.existsSync(mockDir)) {
        fs.mkdirSync(mockDir);
    }
    if (!fs.existsSync(mockFile)) {
        fs.writeFileSync(mockFile, 'module.exports = {}');
    }
    return (req, res, next) => {
        const str = fs
            .readFileSync(mockFile)
            .toString()
            .replace(/^[^{]+/, 'return ')
            .replace(/\b(require|import)\(/g, '(');
        const indexMap = new Function(str)();
        let mockPath;
        Object.keys(indexMap).some((rule) => {
            const isMatch = new RegExp(rule).test(`${req.method.toLocaleUpperCase()} ${req.originalUrl}`);
            if (isMatch) {
                const extname = path.extname(indexMap[rule]);
                if (extname) {
                    if (fs.existsSync(path.join(mockDir, indexMap[rule]))) {
                        mockPath = path.join(mockDir, indexMap[rule]);
                    }
                }
                else if (fs.existsSync(path.join(mockDir, `${indexMap[rule]}.js`))) {
                    mockPath = path.join(mockDir, `${indexMap[rule]}.js`);
                }
                else if (fs.existsSync(path.join(mockDir, `${indexMap[rule]}.ts`))) {
                    mockPath = path.join(mockDir, `${indexMap[rule]}.ts`);
                }
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
}
exports.createMiddleware = createMiddleware;
