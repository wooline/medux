/* eslint-disable @typescript-eslint/no-use-before-define */
import {NextFunction, Request, Response} from 'express';

import axios from 'axios';
import mm from 'micromatch';

const Module: {new (): any} = module.constructor as any;
const ajax = axios.create();

export = function middleware(enableSSR: boolean, replaceTpl?: (req: Request, htmlTpl: string) => string) {
  if (!enableSSR) {
    return function(req: Request, res: Response, next: NextFunction) {
      next();
    };
  }
  const passUrls = ['/index.html', '/server/**', '/client/**', '/sockjs-node/**', '**/*.hot-update.*'];
  return (req: Request, res: Response, next: NextFunction) => {
    if (passUrls.some(reg => mm.isMatch(req.url, reg))) {
      next();
    } else {
      Promise.all([ajax.get(`${req.protocol}://${req.headers.host}/server/main.js`), ajax.get(`${req.protocol}://${req.headers.host}/index.html`)]).then(([main, tpl]) => {
        let htmlTpl: string = tpl.data;
        const arr = htmlTpl.match(/<!--\s*{server-script}\s*-->\s*<script[^>]*>([\s\S]+?)<\/script>/m);
        if (arr) {
          htmlTpl = htmlTpl.replace(arr[0], '');
          const scripts = arr[1].trim();
          scripts && eval(scripts);
        }
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
          const mainModule = new Module();
          mainModule._compile(main.data, 'main.js');
          mainModule.exports
            .default(req.url)
            .then((result: {ssrInitStoreKey: string; data: any; html: string}) => {
              const {ssrInitStoreKey, data, html} = result;
              if (res.headersSent) {
                res.write(htmlChunks[1].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
                res.end();
              } else {
                res.send(htmlChunks[0].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
              }
            })
            .catch(errorHandler);
        } catch (err) {
          return errorHandler(err);
        }
        const htmlStr = replaceTpl ? replaceTpl(req, htmlTpl) : htmlTpl;
        const htmlChunks = htmlStr.split(/<!--\s*{response-chunk}\s*-->/);
        if (htmlChunks[1]) {
          res.write(htmlChunks[0]);
        }
      });
    }
  };
};
