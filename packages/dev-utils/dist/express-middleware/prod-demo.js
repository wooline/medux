"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const mm = __importStar(require("micromatch"));
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
module.exports = function middleware(htmlTpl, mainModule, proxyMap = {}, replaceTpl) {
    const passUrls = getProxys(proxyMap);
    const arr = htmlTpl.match(/<!--\s*{server-script}\s*-->\s*<script[^>]*>([\s\S]+?)<\/script>/m);
    if (arr) {
        htmlTpl = htmlTpl.replace(arr[0], '');
        const scripts = arr[1].trim();
        scripts && eval(scripts);
    }
    return (req, res, next) => {
        const htmlStr = replaceTpl ? replaceTpl(req, htmlTpl) : htmlTpl;
        const htmlChunks = htmlStr.split(/<!--\s*{response-chunk}\s*-->/);
        if (passUrls.some(reg => mm.isMatch(req.url, reg))) {
            next();
        }
        else {
            const errorHandler = (err) => {
                if (err.code === '301' || err.code === '302') {
                    if (res.headersSent) {
                        res.write(`<a data-type="${parseInt(err.code, 10)}" href="${err.detail}">跳转中。。。</a></body><script>window.location.href="${err.detail}"</script></html>`);
                        res.end();
                    }
                    else {
                        res.redirect(parseInt(err.code, 10), err.detail);
                    }
                }
                else {
                    console.error(err);
                    if (res.headersSent) {
                        res.write(`<h1 style="font-size:16px;top:0;left:0;position:fixed;z-index:999999;color:red">${err.message || '服务器错误！'}</h1></body></html>`);
                        res.end();
                    }
                    else {
                        res.send(err.message || '服务器错误！');
                    }
                }
            };
            if (htmlChunks[1]) {
                res.write(htmlChunks[0]);
            }
            try {
                mainModule
                    .default(req.url)
                    .then(result => {
                    const { ssrInitStoreKey, data, html } = result;
                    if (res.headersSent) {
                        res.write(htmlChunks[1].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
                        res.end();
                    }
                    else {
                        res.send(htmlChunks[0].replace(/[^>]*<!--\s*{html}\s*-->[^<]*/m, `${html}`).replace(/<!--\s*{script}\s*-->/, `<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>`));
                    }
                })
                    .catch(errorHandler);
            }
            catch (err) {
                errorHandler(err);
            }
        }
    };
};
