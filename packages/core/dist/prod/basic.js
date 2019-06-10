import"core-js/modules/es.array.iterator";import"core-js/modules/es.object.keys";import"core-js/modules/es.object.to-string";import"core-js/modules/es.promise";import"core-js/modules/es.string.iterator";import"core-js/modules/es.string.split";import"core-js/modules/web.dom-collections.for-each";import"core-js/modules/web.dom-collections.iterator";/*global global:true process:true*/import{setLoading}from"./loading";export var NSP="/";// export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;
export var MetaData={isServer:"undefined"!=typeof global&&"undefined"==typeof window,isDev:"production"!==process.env.NODE_ENV,actionCreatorMap:{},clientStore:null,appModuleName:null};export var client=MetaData.isServer?void 0:window||global;export function getModuleActionCreatorList(a){// if (window["Proxy"]) {
//   actions = new window["Proxy"](
//     {},
//     {
//       get: (target: {}, key: string) => {
//         return (data: any) => ({ type: moduleName + "/" + key, data });
//       }
//     }
//   );
// } else {
//   actions = getModuleActions(moduleName) as any;
// }
if(MetaData.actionCreatorMap[a])return MetaData.actionCreatorMap[a];var b={};return MetaData.actionCreatorMap[a]=b,b}export function isPromise(a){return"function"==typeof a.then}export function getClientStore(){return MetaData.clientStore}export function isServer(){return MetaData.isServer}export function reducer(a,b,c){b||c||(b=a.key,c=a.descriptor);var d=c.value;return d.__actionName__=b,d.__isReducer__=!0,c.enumerable=!0,a.descriptor===c?a:c}export function effect(a,b){return void 0===a&&(a="global",b=MetaData.appModuleName),function(c,d,e){d||e||(d=c.key,e=c.descriptor);var f=e.value;if(f.__actionName__=d,f.__isEffect__=!0,e.enumerable=!0,a){var g=function(c,d,e){MetaData.isServer||(!b&&(b=d),setLoading(e,b,a))};f.__decorators__||(f.__decorators__=[]),f.__decorators__.push([g,null])}return c.descriptor===e?c:e}}export function logger(a,b){return function(c,d,e){d||e||(d=c.key,e=c.descriptor);var f=e.value;f.__decorators__||(f.__decorators__=[]),f.__decorators__.push([a,b])}}export function delayPromise(a){return function(b,c,d){c||d||(c=b.key,d=b.descriptor);var e=d.value;d.value=function(){for(var c=new Promise(function(b){setTimeout(function(){b(!0)},1e3*a)}),d=arguments.length,f=Array(d),g=0;g<d;g++)f[g]=arguments[g];return Promise.all([c,e.apply(b,f)]).then(function(a){return a[1]})}}}function bindThis(a,b){var c=a.bind(b);return Object.keys(a).forEach(function(b){c[b]=a[b]}),c}function transformAction(a,b,c,d){if(d[a]||(d[a]={}),d[a][c])throw new Error("Action duplicate or conflict : "+a+".");d[a][c]=b}function addModuleActionCreatorList(a,b){var c=getModuleActionCreatorList(a);c[b]||(c[b]=function(c){return{type:a+NSP+b,payload:c}})}export function injectActions(a,b,c){for(var d in c)if("function"==typeof c[d]){var e=c[d];if(e.__isReducer__||e.__isEffect__){e=bindThis(e,c);var f=d.split(NSP);f[1]?(e.__isHandler__=!0,transformAction(d,e,b,e.__isEffect__?a._medux_.effectMap:a._medux_.reducerMap)):(e.__isHandler__=!1,transformAction(b+NSP+d,e,b,e.__isEffect__?a._medux_.effectMap:a._medux_.reducerMap),addModuleActionCreatorList(b,d))}}return getModuleActionCreatorList(b)}
//# sourceMappingURL=basic.js.map