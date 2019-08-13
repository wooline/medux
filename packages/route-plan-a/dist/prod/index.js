"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");exports.__esModule=!0,exports.setConfig=setConfig,exports.fillRouteData=fillRouteData,exports.buildTransformRoute=buildTransformRoute;var _objectSpread2=_interopRequireDefault(require("@babel/runtime/helpers/objectSpread")),_matchPath=require("./matchPath"),_deepExtend=_interopRequireDefault(require("deep-extend")),_core=require("@medux/core"),config={escape:!0,dateParse:!0,splitKey:"q",defaultRouteParams:{}};function setConfig(a){a.escape!==void 0&&(config.escape=a.escape),a.dateParse!==void 0&&(config.dateParse=a.dateParse),a.splitKey&&(config.splitKey=a.splitKey),a.defaultRouteParams&&(config.defaultRouteParams=a.defaultRouteParams)}// interface Location {
//   pathname: string;
//   search: string;
//   hash: string;
//   state: RouteData;
// }
// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
function excludeDefaultData(a,b,c,d){var e={};return Object.keys(a).forEach(function(c){var f=a[c],g=b[c];f!==g&&(typeof f==typeof g&&"object"==typeof f&&!Array.isArray(f)&&(f=excludeDefaultData(f,g,!!d&&!d[c])),void 0!==f&&(e[c]=f))}),0!==Object.keys(e).length||c?e:void 0}// 合并默认路由参数，如果路由中某参数没传，将用默认值替代，与上面方法互逆
// function mergeDefaultData(data: {[moduleName: string]: any}, views: {[moduleName: string]: any}) {
//   Object.keys(views).forEach(moduleName => {
//     if (!data[moduleName]) {
//       data[moduleName] = {};
//     }
//   });
//   Object.keys(data).forEach(moduleName => {
//     data[moduleName] = assignDeep({}, defaultRouteParams[moduleName], data[moduleName]);
//   });
// }
// export const mergeDefaultParamsMiddleware: Middleware = () => (next: Function) => (action: any) => {
//   if (action.type === ActionTypes.F_ROUTE_CHANGE) {
//     const payload = getActionData<RouteState>(action);
//     const params = mergeDefaultData(payload.data.views, payload.data.params, defaultRouteParams);
//     action = {...action, payload: {...payload, data: {...payload.data, params}}};
//   }
//   return next(action);
// };
var ISO_DATE_FORMAT=/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;function dateParse(a,b){return"string"==typeof b&&ISO_DATE_FORMAT.test(b)?new Date(b):b}// function getSearch(searchOrHash: string, key: string): string {
//   if (searchOrHash.length < 4) {
//     return '';
//   }
//   const reg = new RegExp(`[&?#]${key}=`);
//   const str = searchOrHash.split(reg)[1];
//   if (!str) {
//     return '';
//   }
//   return str.split('&')[0];
// }
/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/function searchParse(a){if(!a)return{};config.escape&&(a=unescape(a));try{return JSON.parse(a,config.dateParse?dateParse:void 0)}catch(a){return{}}}function joinSearchString(a){for(var b=[""],c=0,d=a.length;c<d;c++)b.push(a[c]||"");return b.join("&"+config.splitKey+"=")}function searchStringify(a){if("object"!=typeof a)return"";var b=JSON.stringify(a);return"{}"===b?"":config.escape?escape(b):b}function splitSearch(a){var b=new RegExp("[&?#]"+config.splitKey+"=[^&]*","g"),c=a.match(b),d=[];return c&&(d=c.map(function(a){return searchParse(a.split("=")[1])})),d}function pathnameParse(a,b,c,d){for(var l in b)if(b.hasOwnProperty(l)){var e=b[l],f="string"==typeof e?[e,null]:e,g=f[0],h=f[1],i=(0,_matchPath.matchPath)(a,{path:l,exact:!h});// const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});
if(i){c.push(g);var j=g.split(_core.config.VSP)[0],k=i.params;return k&&0<Object.keys(k).length&&(d[j]=(0,_objectSpread2.default)({},d[j],k)),void(h&&pathnameParse(a,h,c,d))}}}function compileConfig(a,b,c,d){// ruleToKeys将每条rule中的params key解析出来
for(var l in void 0===b&&(b=""),void 0===c&&(c={}),void 0===d&&(d={}),a)if(a.hasOwnProperty(l)){if(!d[l]){var e=(0,_matchPath.compilePath)(l,{end:!0,strict:!1,sensitive:!1}),f=e.keys;d[l]=f.reduce(function(a,b){return a.push(b.name),a},[])}var g=a[l],h="string"==typeof g?[g,null]:g,i=h[0],j=h[1],k=b+"/"+i;c[k]=l,j&&compileConfig(j,k,c,d)}return{viewToRule:c,ruleToKeys:d}}function assignRouteData(a,b,c){b[0]||(b[0]={});var d=b[0];c&&(0,_deepExtend.default)(d,c);var e=a.reduce(function(a,b){var c=b.split(_core.config.VSP),e=c[0],f=c[1];return f&&(!a[e]&&(a[e]={}),a[e][f]=!0,!d[e]&&(d[e]={})),a},{});Object.keys(d).forEach(function(a){d[a]=(0,_deepExtend.default)({},config.defaultRouteParams[a],d[a])});var f=_deepExtend.default.apply(void 0,[{}].concat(b));return Object.keys(f).forEach(function(a){d[a]||(f[a]=(0,_deepExtend.default)({},config.defaultRouteParams[a],f[a]))}),{views:e,paths:a,params:f,stackParams:b}}function fillRouteData(a){var b=a.extend||{views:{},paths:[],stackParams:[],params:{}},c=[].concat(b.stackParams);return a.stackParams&&a.stackParams.forEach(function(a,b){a&&(c[b]=(0,_deepExtend.default)({},c[b],a))}),assignRouteData(a.paths||b.paths,c)}function extractHashData(a){var b={},c={},d=function(d){if(a[d]&&a.hasOwnProperty(d)){var e=a[d],f=Object.keys(e);0<f.length?f.forEach(function(a){a.startsWith("_")?(!c[d]&&(c[d]={}),c[d][a]=e[a]):(!b[d]&&(b[d]={}),b[d][a]=e[a])}):b[d]={}}};for(var e in a)d(e);return{search:searchStringify(b),hash:searchStringify(c)}}function buildTransformRoute(a){var b=compileConfig(a),c=b.viewToRule,d=b.ruleToKeys;return{locationToRoute:function locationToRoute(b){var c=[],d={};pathnameParse(b.pathname,a,c,d);var e=splitSearch(b.search),f=splitSearch(b.hash);return f.forEach(function(a,b){a&&(0,_deepExtend.default)(e[b],a)}),assignRouteData(c,e,d)},routeToLocation:function routeToLocation(a){var b,e=a.views,f=a.paths,g=a.params,h=a.stackParams,i=h[0],j="";if(0<f.length){// 将args二层克隆params，因为后面可能会删除path中使用到的变量
for(var n in b={},i)i[n]&&i.hasOwnProperty(n)&&(b[n]=(0,_objectSpread2.default)({},i[n]));f.reduce(function(a,e,h){var i=a+"/"+e,k=c[i],l=e.split(_core.config.VSP)[0];//最深的一个view可以决定pathname
if(h===f.length-1){// const toPath = compileToPath(rule.replace(/\$$/, ''));
var n=(0,_matchPath.compileToPath)(k);j=n(g[l])}//pathname中传递的值可以不在params中重复传递
var m=d[k]||[];return m.forEach(function(a){b[l]&&delete b[l][a]}),i},"")}else b=i;//将带_前缀的变量放到hashData中
var k=[].concat(h);k[0]=excludeDefaultData(b,config.defaultRouteParams,!1,e);var l=[],m=[];return k.forEach(function(a,b){var c=extractHashData(a),d=c.search,e=c.hash;d&&(l[b]=d),e&&(m[b]=e)}),{pathname:j,search:"?"+joinSearchString(l).substr(1),hash:"#"+joinSearchString(m).substr(1)}}}}// export function buildTransformRoute(routeConfig: RouteConfig): TransformRoute {
//   const {viewToRule, ruleToKeys} = compileConfig(routeConfig);
//   const locationToRoute: LocationToRoute = location => {
//     const paths: string[] = [];
//     const {stackParams, params} = splitSearch(location.search);
//     //算出paths，并将path参数提取出来并入searchParams中
//     pathnameParse(location.pathname, routeConfig, paths, params);
//     const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
//       const [moduleName, viewName] = cur.split(coreConfig.VSP);
//       if (viewName) {
//         if (!prev[moduleName]) {
//           prev[moduleName] = {};
//         }
//         prev[moduleName]![viewName] = true;
//       }
//       return prev;
//     }, {});
//     const {stackParams: hashStackParams, params: hashParams} = splitSearch(location.hash);
//     //将hash参数并入params中
//     assignDeep(params, hashParams);
//     hashStackParams.forEach((item, index) => {
//       item && assignDeep(stackParams[index], item);
//     });
//     mergeDefaultData(params, views);
//     return {paths, params, views, stackParams};
//   };
//   const routeToLocation: RouteToLocation = routeData => {
//     const {paths, params, stackParams} = routeData;
//     const mainStackParams = stackParams[0] || {};
//     let pathname = '';
//     let args: {[moduleName: string]: {[key: string]: any} | undefined};
//     if (paths.length > 0) {
//       args = {};
//       // 将args二层克隆params，因为后面可能会删除path中使用到的变量
//       for (const moduleName in mainStackParams) {
//         if (mainStackParams[moduleName] && mainStackParams.hasOwnProperty(moduleName)) {
//           args[moduleName] = {...mainStackParams[moduleName]};
//         }
//       }
//       paths.reduce((parentAbsoluteViewName, viewName, index) => {
//         const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
//         const rule = viewToRule[absoluteViewName];
//         const moduleName = viewName.split(coreConfig.VSP)[0];
//         //最深的一个view可以决定pathname
//         if (index === paths.length - 1) {
//           // const toPath = compileToPath(rule.replace(/\$$/, ''));
//           const toPath = compileToPath(rule);
//           pathname = toPath(params[moduleName]);
//         }
//         //pathname中传递的值可以不在params中重复传递
//         const keys = ruleToKeys[rule] || [];
//         keys.forEach(key => {
//           if (args[moduleName]) {
//             delete args[moduleName]![key];
//           }
//         });
//         return absoluteViewName;
//       }, '');
//     } else {
//       args = mainStackParams;
//     }
//     //将带_前缀的变量放到hashData中
//     const searchData = {};
//     const hashData = {};
//     for (const moduleName in args) {
//       if (args[moduleName] && args.hasOwnProperty(moduleName)) {
//         const data = args[moduleName]!;
//         const keys = Object.keys(data);
//         if (keys.length > 0) {
//           keys.forEach(key => {
//             if (key.startsWith('_')) {
//               if (!hashData[moduleName]) {
//                 hashData[moduleName] = {};
//               }
//               hashData[moduleName][key] = data[key];
//             } else {
//               if (!searchData[moduleName]) {
//                 searchData[moduleName] = {};
//               }
//               searchData[moduleName][key] = data[key];
//             }
//           });
//         }
//       }
//     }
//     return {
//       pathname,
//       search: searchStringify(excludeDefaultData(searchData, defaultRouteParams)),
//       hash: searchStringify(excludeDefaultData(hashData, defaultRouteParams)),
//     };
//   };
//   return {
//     locationToRoute,
//     routeToLocation,
//   };
// }
/**
 '/:articleType/:articleId/comments/:itemId'
 www.aa.com/photos/1/comments/23?p={}&p=

 paths:["app.Main", "photos.detail", "comments.detail"]
 params:{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}
 stackParams:[{app:{}}, {photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222}}, {comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]
 stackParams:[{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]

 web: www.aa.com/photos/1/comments/23?p={comments:{searchList:{page:2}}}#p={photos:{_listkey:222222}, comments:{_listkey:222222}}

 rn: www.aa.com/photos/1/comments/23?p={app:{}}&p={photos:{}}&p={comments:{searchList:{page:2}}}#p={}&p={photos:{_listkey:222222}}&p={comments:{_listkey:222222}}

 routeData -> location
1.根据paths得到匹配表达式：'/:articleType/:articleId/comments/:itemId'
2.根据params填充表达式得到：www.aa.com/photos/1/comments/23
3.将params中带_的提取为hash
不作缩减将得到：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1,searchList:{page:1,pageSize:10}}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
4.缩减默认值：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
5.缩减路径传参
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{}}&
p={comments:{searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}



 location->routeData
1.解析出paths、views、pathArgs
2.

 */
//# sourceMappingURL=index.js.map