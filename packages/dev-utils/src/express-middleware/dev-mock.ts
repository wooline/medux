import {NextFunction, Request, Response} from 'express';

import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import jsonFormat from 'json-format';
import mm from 'micromatch';
import path from 'path';
import zlib from 'zlib';

function checkDir(maxNum: number) {
  const dir = path.resolve('./mock');
  const tempDir = path.join(dir, 'temp/');
  const sourceDir = dir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir);
  }
  fs.readdir(tempDir, (err, files) => {
    if (!err) {
      if (files.length > maxNum) {
        const arr = files.map(file => {
          file = path.join(tempDir, file);
          return {file, time: fs.statSync(file).atimeMs};
        });
        arr.sort((a, b) => b.time - a.time);
        arr.slice(Math.round(maxNum - maxNum / 3)).forEach(item => {
          fs.unlinkSync(item.file);
        });
      }
    }
  });
  return {tempDir, sourceDir};
}

function getResult(url: string, buffer: Buffer, res: Response) {
  const statusCode = res.statusCode;
  const contentType = res.get('content-type') || '';
  let body = '';
  if (buffer.length) {
    const encoding = contentType.split('charset=')[1] || 'utf8';
    if (res.getHeader('content-encoding') === 'gzip') {
      try {
        body = zlib.gunzipSync(buffer).toString(encoding);
      } catch (e) {
        console.log('error', url);
        body = '{}';
      }
    } else {
      body = buffer.toString(encoding);
    }
    if (/\bjson\b/.test(contentType)) {
      body = JSON.parse(body);
    }
  }

  const resHeaders = {...res.getHeaders()};
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
function serializeUrl(method: string, url: string) {
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

function urlToFileName(method: string, url: string, sourceDir: string, tempDir: string) {
  const name = serializeUrl(method, url);
  const fileName = name + '.js';
  let sourceFileName = path.join(sourceDir, fileName);
  let tempFileName = path.join(tempDir, fileName);
  if (tempFileName.length > 240) {
    const md5 = crypto.createHash('md5');
    sourceFileName = path.join(sourceDir, md5.update(name).digest('hex') + '--' + name).substr(0, 240) + '.js';
    tempFileName = path.join(tempDir, md5.update(name).digest('hex') + '--' + name).substr(0, 240) + '.js';
  }
  return {sourceFileName, tempFileName, fileName};
}

function parseFile(req: Request, content: string, res: Response) {
  const fun = new Function('request', content);
  const data = fun(req);
  let str = data.response;
  if (typeof str === 'object') {
    data.headers['content-type'] = 'application/json; charset=utf-8';
    str = JSON.stringify(str);
  }
  data.headers['content-length'] = Buffer.byteLength(str).toString();
  if (data.headers['x-delay']) {
    setTimeout(() => {
      res.status(data.statusCode || 200);
      res.set(data.headers);
      res.end(str);
    }, parseInt(data.headers['x-delay'], 10) || 1000);
  } else {
    res.status(data.statusCode || 200);
    res.set(data.headers);
    res.end(str);
  }
}

const fileNamesLatest: {date: number; files: {[name: string]: boolean}; regExpFiles: {[name: string]: RegExp}} = {date: 0, files: {}, regExpFiles: {}};

function cacheFileNames(sourceDir: string, timeout: number) {
  const now = new Date().getTime();
  if (now - fileNamesLatest.date > timeout) {
    const fileList = fs.readdirSync(sourceDir);
    fileNamesLatest.date = now;
    fileNamesLatest.files = {};
    fileNamesLatest.regExpFiles = {};
    fileList.forEach(name => {
      if (name.endsWith('.js')) {
        const arr = name.split('@');
        if (arr[1]) {
          name = arr[1];
          const str = new Buffer(name.replace('.js', ''), 'base64').toString();
          fileNamesLatest.regExpFiles[name] = new RegExp(str);
        } else {
          fileNamesLatest.files[name] = true;
        }
      }
    });
  }
}

function getProxys(proxyMap: {[key: string]: any} | {context: string[] | string}[] | Function) {
  if (typeof proxyMap === 'function') {
    proxyMap = proxyMap();
  }
  if (Array.isArray(proxyMap)) {
    proxyMap = proxyMap.reduce((pre, cur) => {
      const url = cur.context;
      if (typeof url === 'string') {
        pre[url] = true;
      } else {
        for (const key of url) {
          pre[key] = true;
        }
      }
      return pre;
    }, {});
  }
  return Object.keys(proxyMap);
}

function hitMockFile(fileName: string): string | RegExpMatchArray {
  if (fileNamesLatest.files[fileName]) {
    return fileName;
  }
  const obj = fileNamesLatest.regExpFiles;
  const str = fileName.replace('.js', '');
  for (const name in obj) {
    if (obj.hasOwnProperty(name)) {
      const match = str.match(obj[name]);
      if (match) {
        match.input = name;
        return match;
      }
    }
  }
  return '';
}

export = function middleware(
  enable: boolean,
  proxyMap: {[key: string]: any} | {context: string[] | string}[] | Function,
  enableRecord: boolean = false,
  maxNum: number = 1000,
  cacheTimeout: number = 3000
) {
  if (!enable || !proxyMap) {
    return function(req: Request, res: Response, next: NextFunction) {
      next();
    };
  }

  const proxyUrls = getProxys(proxyMap);
  const {tempDir, sourceDir} = checkDir(maxNum);
  return function(req: Request, res: Response, next: NextFunction) {
    if (!proxyUrls.some(reg => mm.isMatch(req.url, reg))) {
      next();
    } else {
      const {sourceFileName, tempFileName, fileName} = urlToFileName(req.method, req.url, sourceDir, tempDir);
      cacheFileNames(sourceDir, cacheTimeout);
      const mockFile = hitMockFile(fileName);
      if (mockFile) {
        let file: string = mockFile as string;
        let regData: string[] | null = null;
        if (typeof mockFile !== 'string') {
          file = mockFile.input!;
          regData = mockFile;
        }
        fs.readFile(path.join(sourceDir, file), 'utf-8', function(err, content) {
          if (err) {
            console.error(err);
            res.writeHead(500, {'content-type': 'text/plain; charset=utf-8'});
            res.end(err.toString());
          } else {
            try {
              parseFile(
                req,
                regData
                  ? content.replace(/\$\{(\d+)\}/g, function($0, $1) {
                      return regData![$1];
                    })
                  : content,
                res
              );
            } catch (err) {
              console.error(err);
              res.writeHead(500, {'content-type': 'text/plain; charset=utf-8'});
              res.end(err.toString());
            }
          }
        });
      } else if (enableRecord) {
        const owrite = res.write;
        const oend = res.end;
        let buffer = Buffer.from('');

        res.end = (...args: any) => {
          const statusCode = res.statusCode;
          const contentType = res.get('content-type') || '';
          if ((statusCode === 200 || statusCode === 201 || statusCode === 204) && args.length === 0 && (!contentType || /\bjson\b|\bhtml\b|\btext\b/.test(contentType))) {
            const data = getResult(req.url, buffer, res);
            fs.writeFile(tempFileName, 'return ' + jsonFormat(data, {type: 'space'}), err => {
              if (err) {
                console.error(err);
              }
            });
          } else if (statusCode >= 400) {
            console.info(chalk`{white.bold mock proxy => } {green.bold ${sourceFileName}}`);
          }
          return oend.apply(res, args);
        };
        res.write = (...args: any) => {
          // proxy路由调用write方法，其余调用send方法
          if (Buffer.isBuffer(args[0])) {
            buffer = Buffer.concat([buffer, args[0]]);
          }
          return owrite.apply(res, args);
        };
        next();
      } else {
        next();
      }
    }
  };
};
