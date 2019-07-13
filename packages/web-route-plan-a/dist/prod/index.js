import"core-js/modules/es.array.iterator";import"core-js/modules/es.function.name";import"core-js/modules/es.object.keys";import"core-js/modules/es.object.to-string";import"core-js/modules/es.regexp.constructor";import"core-js/modules/es.regexp.to-string";import"core-js/modules/es.string.ends-with";import"core-js/modules/es.string.replace";import"core-js/modules/es.string.search";import"core-js/modules/es.string.split";import"core-js/modules/es.string.starts-with";import"core-js/modules/web.dom-collections.for-each";import"core-js/modules/web.dom-collections.iterator";import _objectSpread from"@babel/runtime/helpers/esm/objectSpread";import{ActionTypes,NSP,defaultRouteParams,getActionData,routeCompleteAction}from"@medux/core";import{compilePath,compileToPath,matchPath}from"./matchPath";import assignDeep from"deep-extend";// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
function excludeDefaultData(a,b){var c={};return Object.keys(a).forEach(function(d){var e=a[d],f=b[d];e!==f&&(typeof e!=typeof f||"object"!=typeof e||Array.isArray(e)?c[d]=e:c[d]=excludeDefaultData(e,f))}),0===Object.keys(c).length?void 0:c}// 合并默认路由参数，如果路由中某参数没传，将用默认值替代，与上面方法互逆
function mergeDefaultData(a,b,c){var d=_objectSpread({},b);return Object.keys(a).forEach(function(a){!d[a]&&c[a]&&(d[a]={})}),Object.keys(d).forEach(function(a){c[a]&&(d[a]=assignDeep({},c[a],d[a]))}),d}export var mergeDefaultParamsMiddleware=function(a){var b=a.dispatch,c=a.getState;return function(a){return function(d){if(d.type===ActionTypes.F_ROUTE_CHANGE){var e=getActionData(d),f=mergeDefaultData(e.data.views,e.data.params,defaultRouteParams);return d=_objectSpread({},d,{payload:_objectSpread({},e,{data:_objectSpread({},e.data,{params:f})})}),setTimeout(function(){return b(routeCompleteAction())},0),a(d)}var g=d.type.split(NSP),h=g[0],i=g[1];if(h&&i===ActionTypes.M_INIT){var j,k,l=c(),m=l.route,n=m.data.params||{},o=n[h],p=getActionData(d),q=mergeDefaultData((j={},j[h]=!0,j),(k={},k[h]=o,k),defaultRouteParams)[h]||{};return d=_objectSpread({},d,{payload:_objectSpread({},p,{routeParams:q})}),a(d)}return a(d)}}};function getSearch(a,b){if(4>a.length)return"";var c=new RegExp("[&?]"+b+"="),d=("#"+a).split(c)[1];return d?d.split("&")[0]:""}var ISO_DATE_FORMAT=/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/function searchParse(a,b){return void 0===b&&(b="q"),a=getSearch(a,b),a?JSON.parse(unescape(a),function(a,b){return"string"==typeof b&&ISO_DATE_FORMAT.test(b)?new Date(b):b}):void 0}function searchStringify(a,b){if(void 0===b&&(b="q"),!a)return"";var c=JSON.stringify(a);return c&&"{}"!==c?b+"="+escape(c):""}function pathnameParse(a,b,c,d){for(var k in b)if(b.hasOwnProperty(k)){var l=matchPath(a,{path:k.replace(/\$$/,""),exact:k.endsWith("$")});if(l){var e=b[k],f="string"==typeof e?[e,null]:e,g=f[0],h=f[1];c.push(g);var i=g.split(".")[0],j=l.params;return j&&0<Object.keys(j).length&&(d[i]=_objectSpread({},d[i],j)),void(h&&pathnameParse(a,h,c,d))}}}function compileConfig(a,b,c,d){// ruleToKeys将每条rule中的params key解析出来
for(var l in void 0===b&&(b=""),void 0===c&&(c={}),void 0===d&&(d={}),a)if(a.hasOwnProperty(l)){if(!d[l]){var e=compilePath(l.replace(/\$$/,""),{end:l.endsWith("$"),strict:!1,sensitive:!1}),f=e.keys;d[l]=f.reduce(function(a,b){return a.push(b.name),a},[])}var g=a[l],h="string"==typeof g?[g,null]:g,i=h[0],j=h[1],k=b+"/"+i;c[k]=l,j&&compileConfig(j,k,c,d)}return{viewToRule:c,ruleToKeys:d}}export function fillRouteData(a){var b=a.paths,c=a.paths.reduce(function(a,b){var c=b.split("."),d=c[0],e=c[1];return e&&(!a[d]&&(a[d]={}),a[d][e]=!0),a},{}),d=mergeDefaultData(c,a.params,defaultRouteParams);return{views:c,paths:b,params:d}}export function getHistory(a){return{push:function push(b){var c=b;"string"==typeof b||b.pathname||(c=fillRouteData(b)),a().push(c)},replace:function replace(b){var c=b;"string"==typeof b||b.pathname||(c=fillRouteData(b)),a().replace(c)},go:function go(b){a().go(b)},goBack:function goBack(){a().goBack()},goForward:function goForward(){a().goForward()}}}export function buildTransformRoute(a){var b=compileConfig(a),c=b.viewToRule,d=b.ruleToKeys;return{locationToRoute:function locationToRoute(b){var c=[],d=searchParse(b.search)||{};pathnameParse(b.pathname,a,c,d);var e=c.reduce(function(a,b){var c=b.split("."),d=c[0],e=c[1];return e&&(!a[d]&&(a[d]={}),a[d][e]=!0),a},{}),f=searchParse(b.hash)||{},g=function(a){if(f.hasOwnProperty(a)){var b=f[a];Object.keys(b).forEach(function(c){d[a][c]=b[c]})}};for(var h in f)g(h);return{paths:c,params:d,views:e}},routeToLocation:function routeToLocation(a){var b,e=a.paths,f=a.params,g="";if(0<e.length){// 将args二层克隆params，因为后面可能会删除path中使用到的变量
for(var k in b={},f)f[k]&&f.hasOwnProperty(k)&&(b[k]=_objectSpread({},f[k]));e.reduce(function(a,h,i){var j=a+"/"+h,k=c[j],l=h.split(".")[0];//最深的一个view可以决定pathname
if(i===e.length-1){var n=compileToPath(k.replace(/\$$/,""));g=n(f[l])}//pathname中传递的值可以不在params中重复传递
var m=d[k]||[];return m.forEach(function(a){b[l]&&delete b[l][a]}),j},"")}else b=f;//将带_前缀的变量放到hashData中
var h={},i={},j=function(a){if(b[a]&&b.hasOwnProperty(a)){var c=b[a],d=Object.keys(c);0<d.length&&d.forEach(function(b){b.startsWith("_")?(!i[a]&&(i[a]={}),i[a][b]=c[b]):(!h[a]&&(h[a]={}),h[a][b]=c[b])})}};for(var l in b)j(l);return{pathname:g,search:searchStringify(excludeDefaultData(h,defaultRouteParams)),hash:searchStringify(excludeDefaultData(i,defaultRouteParams))}}}}
//# sourceMappingURL=index.js.map