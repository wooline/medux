/*global global:true process:true*/import{setLoading}from"./loading";export var NSP="/";export var VSP=".";// export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;
export var MetaData={isServer:"undefined"!=typeof global&&"undefined"==typeof window,isDev:"production"!==process.env.NODE_ENV,actionCreatorMap:null,clientStore:null,appModuleName:null,moduleGetter:null,defaultRouteParams:{}};export var defaultRouteParams=MetaData.defaultRouteParams;export var client=MetaData.isServer?void 0:"undefined"==typeof window?global:window;export function isPromise(a){return"object"==typeof a&&"function"==typeof a.then}export function getStore(){return MetaData.clientStore}export function isServer(){return MetaData.isServer}export function reducer(a,b,c){b||c||(b=a.key,c=a.descriptor);var d=c.value;return d.__actionName__=b,d.__isReducer__=!0,c.enumerable=!0,a.descriptor===c?a:c}export function effect(a,b){return void 0===a&&(a="global",b=MetaData.appModuleName),function(c,d,e){d||e||(d=c.key,e=c.descriptor);var f=e.value;if(f.__actionName__=d,f.__isEffect__=!0,e.enumerable=!0,a){var g=function(c,d,e){MetaData.isServer||(!b&&(b=d),setLoading(e,b,a))};f.__decorators__||(f.__decorators__=[]),f.__decorators__.push([g,null])}return c.descriptor===e?c:e}}export function logger(a,b){return function(c,d,e){d||e||(d=c.key,e=c.descriptor);var f=e.value;f.__decorators__||(f.__decorators__=[]),f.__decorators__.push([a,b])}}export function delayPromise(a){return function(b,c,d){c||d||(c=b.key,d=b.descriptor);var e=d.value;d.value=function(){for(var c=new Promise(function(b){setTimeout(function(){b(!0)},1e3*a)}),d=arguments.length,f=Array(d),g=0;g<d;g++)f[g]=arguments[g];return Promise.all([c,e.apply(b,f)]).then(function(a){return a[1]})}}}export function isProcessedError(a){return"object"!=typeof a||void 0===a.meduxProcessed?void 0:!!a.meduxProcessed}export function setProcessedError(a,b){return"object"==typeof a?(a.meduxProcessed=b,a):{meduxProcessed:b,error:a}}function bindThis(a,b){var c=a.bind(b);return Object.keys(a).forEach(function(b){c[b]=a[b]}),c}function transformAction(a,b,c,d){if(d[a]||(d[a]={}),d[a][c])throw new Error("Action duplicate or conflict : "+a+".");d[a][c]=b}function addModuleActionCreatorList(a,b){var c=MetaData.actionCreatorMap[a];c[b]||(c[b]=function(c){return{type:a+NSP+b,payload:c}})}export function injectActions(a,b,c){for(var d in c)"function"==typeof c[d]&&function(){var e=c[d];(e.__isReducer__||e.__isEffect__)&&(e=bindThis(e,c),d.split(",").forEach(function(c){c=c.trim().replace(/^this\//,""+b+NSP);var d=c.split(NSP);d[1]?(e.__isHandler__=!0,transformAction(c,e,b,e.__isEffect__?a._medux_.effectMap:a._medux_.reducerMap)):(e.__isHandler__=!1,transformAction(b+NSP+c,e,b,e.__isEffect__?a._medux_.effectMap:a._medux_.reducerMap),addModuleActionCreatorList(b,c))}))}();return MetaData.actionCreatorMap[b]}
//# sourceMappingURL=basic.js.map