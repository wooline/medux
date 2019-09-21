import * as mm from 'micromatch';

import {NextFunction, Request, Response} from 'express';

import axios from 'axios';

const Module: {new (): any} = module.constructor as any;

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

export = function middleware(enable: boolean, proxyMap: {[key: string]: any} | {context: string[] | string}[] | Function = {}) {
  if (!enable) {
    return function(req: Request, res: Response, next: NextFunction) {
      next();
    };
  }
  const passUrls = [...getProxys(proxyMap), '/index.html', '/server/**', '/client/**', '/sockjs-node/**', '**/*.hot-update.*'];
  return (req: Request, res: Response, next: NextFunction) => {
    if (passUrls.some(reg => mm.isMatch(req.url, reg))) {
      next();
    } else {
      const errorHandler = (err: any) => {
        if (err.code === '301' || err.code === '302') {
          if (res.headersSent) {
            res.write(`<a data-type="${parseInt(err.code, 10)}" href="${err.detail}">跳转中。。。</a></body><script>window.location.href="${err.detail}"</script></html>`);
            res.end();
          } else {
            res.redirect(parseInt(err.code, 10), err.detail);
          }
        } else {
          console.error(err);
          if (res.headersSent) {
            res.write(`<h1 style="font-size:16px;top:0;left:0;position:fixed;z-index:999999;color:red">${err.message || '服务器错误！'}</h1></body></html>`);
            res.end();
          } else {
            res.send(err.message || '服务器错误！');
          }
        }
      };
      try {
        Promise.all([axios.get(`${req.protocol}://${req.headers.host}/server/main.js`), axios.get(`${req.protocol}://${req.headers.host}/index.html`)])
          .then(([main, tpl]) => {
            const arr = tpl.data.match(/<!--\s*{server-script}\s*-->\s*<script[^>]*>([\s\S]+?)<\/script>/m);
            if (arr) {
              tpl.data = tpl.data.replace(arr[0], '');
              const scripts = arr[1].trim();
              scripts && eval(scripts);
            }
            const htmlChunks = tpl.data.split(/<!--\s*{response-chunk}\s*-->/);
            if (htmlChunks[1]) {
              res.write(htmlChunks[0]);
            }
            const mainModule = new Module();
            mainModule._compile(main.data, 'main.js');
            return mainModule.exports.default(req.url).then((result: {ssrInitStoreKey: string; data: any; html: string}) => {
              const {ssrInitStoreKey, data, html} = result;
              if (res.headersSent) {
                res.write(htmlChunks[1].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
                res.end();
              } else {
                res.send(htmlChunks[0].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
              }
            });
          })
          .catch(errorHandler);
      } catch (err) {
        errorHandler(err);
      }
    }
  };
};
