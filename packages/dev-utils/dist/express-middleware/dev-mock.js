"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const chalk_1 = __importDefault(require("chalk"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const json_format_1 = __importDefault(require("json-format"));
const micromatch_1 = __importDefault(require("micromatch"));
const mockjs_1 = __importDefault(require("mockjs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
function checkDir(maxNum) {
    const dir = path_1.default.resolve('./mock');
    const tempDir = path_1.default.join(dir, 'temp/');
    const sourceDir = dir;
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir);
    }
    if (!fs_1.default.existsSync(sourceDir)) {
        fs_1.default.mkdirSync(sourceDir);
    }
    fs_1.default.readdir(tempDir, (err, files) => {
        if (!err) {
            if (files.length > maxNum) {
                const arr = files.map(file => {
                    file = path_1.default.join(tempDir, file);
                    return { file, time: fs_1.default.statSync(file).atimeMs };
                });
                arr.sort((a, b) => b.time - a.time);
                arr.slice(Math.round(maxNum - maxNum / 3)).forEach(item => {
                    fs_1.default.unlinkSync(item.file);
                });
            }
        }
    });
    return { tempDir, sourceDir };
}
function getResult(url, buffer, res) {
    const statusCode = res.statusCode;
    const contentType = res.get('content-type') || '';
    let body = '';
    if (buffer.length) {
        const encoding = contentType.split('charset=')[1] || 'utf8';
        if (res.getHeader('content-encoding') === 'gzip') {
            try {
                body = zlib_1.default.gunzipSync(buffer).toString(encoding);
            }
            catch (e) {
                console.log('error', url);
                body = '{}';
            }
        }
        else {
            body = buffer.toString(encoding);
        }
        if (/\bjson\b/.test(contentType)) {
            body = JSON.parse(body);
        }
    }
    const resHeaders = Object.assign({}, res.getHeaders());
    delete resHeaders['content-length'];
    delete resHeaders['etag'];
    delete resHeaders['date'];
    delete resHeaders['content-encoding'];
    return {
        url,
        statusCode,
        statusMessage: res.statusMessage,
        headers: resHeaders,
        response: body,
    };
}
function serializeUrl(method, url) {
    const arr = url.split('?');
    if (arr[1]) {
        url =
            arr[0] +
                '?' +
                arr[1]
                    .split('&')
                    .sort()
                    .join('&');
    }
    return (method.toLowerCase() + '/' + url)
        .replace(/\//g, '-')
        .replace('?', '$')
        .replace(/[?*:"<>\/|]/g, '-');
}
function urlToFileName(method, url, sourceDir, tempDir) {
    const name = serializeUrl(method, url);
    const fileName = name + '.js';
    let sourceFileName = path_1.default.join(sourceDir, fileName);
    let tempFileName = path_1.default.join(tempDir, fileName);
    if (tempFileName.length > 240) {
        const md5 = crypto_1.default.createHash('md5');
        const fileName = md5.update(name).digest('hex') + '--' + name;
        sourceFileName = path_1.default.join(sourceDir, fileName).substr(0, 240) + '.js';
        tempFileName = path_1.default.join(tempDir, fileName).substr(0, 240) + '.js';
    }
    return { sourceFileName, tempFileName, fileName };
}
function endSend(res, content, data) {
    res.status(data.statusCode || 200);
    res.set(data.headers);
    if (Array.isArray(data.cookies)) {
        data.cookies.forEach(item => {
            res.cookie(...item);
        });
    }
    res.end(content);
}
function parseFile(req, res, database, content) {
    const fun = new Function('request', 'mockjs', 'database', content);
    const data = fun(req, mockjs_1.default, database);
    let str = data.response;
    if (typeof str === 'object') {
        data.headers['content-type'] = 'application/json; charset=utf-8';
        str = JSON.stringify(str);
    }
    data.headers['content-length'] = Buffer.byteLength(str).toString();
    if (data.headers['x-delay']) {
        setTimeout(() => {
            endSend(res, str, data);
        }, parseInt(data.headers['x-delay'], 10) || 1000);
    }
    else {
        endSend(res, str, data);
    }
}
const fileNamesLatest = { date: 0, files: {}, regExpFiles: {} };
function cacheFileNames(sourceDir, timeout) {
    const now = Date.now();
    if (now - fileNamesLatest.date > timeout) {
        const fileList = fs_1.default.readdirSync(sourceDir);
        fileNamesLatest.date = now;
        fileNamesLatest.files = {};
        fileNamesLatest.regExpFiles = {};
        fileList.forEach(name => {
            if (name.endsWith('.js')) {
                const arr = name.split('@');
                if (arr[1]) {
                    const str = new Buffer(arr[1].replace('.js', ''), 'base64').toString();
                    fileNamesLatest.regExpFiles[str] = name;
                }
                else {
                    fileNamesLatest.files[name] = name;
                }
            }
        });
    }
}
function getProxys(proxyMap) {
    if (typeof proxyMap === 'function') {
        proxyMap = proxyMap();
    }
    if (Array.isArray(proxyMap)) {
        proxyMap = proxyMap.reduce((pre, cur) => {
            const url = cur.context;
            if (typeof url === 'string') {
                pre[url] = true;
            }
            else {
                for (const key of url) {
                    pre[key] = true;
                }
            }
            return pre;
        }, {});
    }
    return Object.keys(proxyMap);
}
function hitMockFile(fileName) {
    if (fileNamesLatest.files[fileName]) {
        return fileName;
    }
    const obj = fileNamesLatest.regExpFiles;
    const str = fileName.replace('.js', '');
    for (const rule in obj) {
        if (obj.hasOwnProperty(rule)) {
            if (str.match(new RegExp(rule))) {
                return obj[rule];
            }
        }
    }
    return '';
}
module.exports = function middleware(enable, proxyMap, enableRecord = false, maxNum = 1000, cacheTimeout = 3000) {
    if (!enable || !proxyMap) {
        return function (req, res, next) {
            next();
        };
    }
    const proxyUrls = getProxys(proxyMap);
    const { tempDir, sourceDir } = checkDir(maxNum);
    const databaseMock = path_1.default.join(sourceDir, 'database.js');
    let database = {};
    if (fs_1.default.existsSync(databaseMock)) {
        const content = fs_1.default.readFileSync(path_1.default.join(sourceDir, 'database.js'), 'utf-8');
        if (content) {
            try {
                const fun = new Function('mockjs', content);
                database = fun(mockjs_1.default);
            }
            catch (err) {
                console.error(err, 'database.js');
            }
        }
    }
    return function (req, res, next) {
        if (!proxyUrls.some(reg => micromatch_1.default.isMatch(req.url, reg))) {
            next();
        }
        else {
            const { sourceFileName, tempFileName, fileName } = urlToFileName(req.method, req.url, sourceDir, tempDir);
            cacheFileNames(sourceDir, cacheTimeout);
            const mockFile = hitMockFile(fileName);
            if (mockFile) {
                fs_1.default.readFile(path_1.default.join(sourceDir, mockFile), 'utf-8', function (err, content) {
                    if (err) {
                        console.error(err);
                        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                        res.end(err.toString());
                    }
                    else {
                        try {
                            parseFile(req, res, database, content);
                        }
                        catch (err) {
                            console.error(err, mockFile);
                            res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                            res.end(err.toString());
                        }
                    }
                });
            }
            else if (enableRecord) {
                const owrite = res.write;
                const oend = res.end;
                let buffer = Buffer.from('');
                res.end = (...args) => {
                    const statusCode = res.statusCode;
                    const contentType = res.get('content-type') || '';
                    if ((statusCode === 200 || statusCode === 201 || statusCode === 204) && args.length === 0 && (!contentType || /\bjson\b|\bhtml\b|\btext\b/.test(contentType))) {
                        const data = getResult(req.url, buffer, res);
                        fs_1.default.writeFile(tempFileName, 'return ' + json_format_1.default(data, { type: 'space' }), err => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                    else if (statusCode >= 400) {
                        console.info(chalk_1.default `{white.bold mock proxy => } {green.bold ${sourceFileName}}`);
                    }
                    return oend.apply(res, args);
                };
                res.write = (...args) => {
                    if (Buffer.isBuffer(args[0])) {
                        buffer = Buffer.concat([buffer, args[0]]);
                    }
                    return owrite.apply(res, args);
                };
                next();
            }
            else {
                next();
            }
        }
    };
};
