import"core-js/modules/es.array.concat";import"core-js/modules/es.array.filter";import"core-js/modules/es.array.iterator";import"core-js/modules/es.object.keys";import"core-js/modules/es.object.to-string";import"core-js/modules/es.promise";import"core-js/modules/es.regexp.constructor";import"core-js/modules/es.regexp.to-string";import"core-js/modules/es.string.iterator";import"core-js/modules/es.string.replace";import"core-js/modules/es.string.split";import"core-js/modules/web.dom-collections.for-each";import"core-js/modules/web.dom-collections.iterator";import _objectSpread from"@babel/runtime/helpers/esm/objectSpread";import{MetaData,NSP,client,isPromise}from"./basic";import{ActionTypes,errorAction,viewInvalidAction}from"./actions";import{applyMiddleware,compose,createStore}from"redux";import{injectModel}from"./module";import{isPlainObject}from"./sprite";var invalidViewTimer;function checkInvalidview(){invalidViewTimer=0;var a=MetaData.clientStore._medux_.currentViews,b={};for(var c in a)if(a.hasOwnProperty(c)){var d=a[c];for(var e in d)d[e]&&(b[c][e]=!0)}MetaData.clientStore.dispatch(viewInvalidAction(b))}export function invalidview(){MetaData.isServer||!invalidViewTimer&&(invalidViewTimer=setTimeout(checkInvalidview,300))}export function viewWillMount(a,b){if(!MetaData.isServer){var c=MetaData.clientStore._medux_.currentViews;if(!c[a]){var d;c[a]=(d={},d[b]=!0,d)}else c[a][b]=!0;invalidview()}}export function viewWillUnmount(a,b){if(!MetaData.isServer){var c=MetaData.clientStore._medux_.currentViews;c[a]&&c[a][b]&&delete c[a][b],invalidview()}}function getActionData(a){var b=Object.keys(a).filter(function(a){return"type"!==a&&"priority"!==a&&"time"!==a});if(0!==b.length){if(1===b.length)return a[b[0]];var c=_objectSpread({},a);return delete c.type,delete c.priority,delete c.time,c}}function simpleEqual(a,b){if(a===b)return!0;if(typeof a!=typeof b||"object"!=typeof a)return!1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return!1;for(var e,f=0,g=c;f<g.length;f++)if(e=g[f],!simpleEqual(a[e],b[e]))return!1;return!0}export function buildStore(a,b,c,d){if(void 0===a&&(a={}),void 0===b&&(b={}),void 0===c&&(c=[]),void 0===d&&(d=[]),!isPlainObject(a))throw new Error("preloadedState must be plain objects!");if(!isPlainObject(b))throw new Error("storeReducers must be plain objects!");var e,f=function(a,c){if(!e)return a;var d=e._medux_;d.prevState=a;var f=_objectSpread({},a);if(d.currentState=f,f.views||(f.views={}),Object.keys(b).forEach(function(a){f[a]=b[a](f[a],c)}),c.type===ActionTypes.F_VIEW_INVALID){var l=getActionData(c);simpleEqual(f.views,l)||(f.views=l)}var g=d.reducerMap[c.type]||{},h=d.reducerMap[c.type.replace(new RegExp("[^"+NSP+"]+"),"*")]||{},i=_objectSpread({},g,h),j=Object.keys(i);// 支持泛监听，形如 */loading
if(0<j.length){var m=c.priority?[].concat(c.priority):[];j.forEach(function(a){var b=i[a];b.__isHandler__?m.push(a):m.unshift(a)});var n={};m.forEach(function(a){if(!n[a]){n[a]=!0;var b=i[a];f[a]=b(getActionData(c))}})}var k=Object.keys(a).length!==Object.keys(f).length||Object.keys(a).some(function(b){return a[b]!==f[b]});return d.prevState=k?f:a,d.prevState},g=applyMiddleware.apply(void 0,[function preLoadMiddleware(){return function(a){return function(b){var c=b.type.split(NSP),d=c[0],f=c[1];if(d&&f&&MetaData.moduleGetter[d]){var g=injectModel(MetaData.moduleGetter,d,e);if(isPromise(g))return g.then(function(){return a(b)})}return a(b)}}}].concat(c,[function middleware(){return function(a){return function(b){if(MetaData.isServer&&b.type.split(NSP)[1]===ActionTypes.M_LOADING)return b;var c=a(b),d=e._medux_.effectMap[c.type]||{},f=e._medux_.effectMap[c.type.replace(new RegExp("[^"+NSP+"]+"),"*")]||{},g=_objectSpread({},d,f),h=Object.keys(g);if(0<h.length){var k=c.priority?[].concat(c.priority):[];h.forEach(function(a){var b=g[a];b.__isHandler__?k.push(a):k.unshift(a)});var i={},j=[];if(k.forEach(function(a){if(!i[a]){i[a]=!0;var b=g[a],d=b(getActionData(c)),e=b.__decorators__;if(e){var f=[];e.forEach(function(b,e){f[e]=b[0](c,a,d)}),b.__decoratorResults__=f}d.then(function(a){if(e){var c=b.__decoratorResults__||[];e.forEach(function(b,d){b[1]&&b[1]("Resolved",c[d],a)}),b.__decoratorResults__=void 0}return a},function(a){if(e){var c=b.__decoratorResults__||[];e.forEach(function(b,d){b[1]&&b[1]("Rejected",c[d],a)}),b.__decoratorResults__=void 0}}),j.push(d)}}),j.length)return Promise.all(j)}return c}}}])),h=[].concat(d,[g,function enhancer(a){return function(){var b=a.apply(void 0,arguments);return b._medux_={prevState:{router:null},currentState:{router:null},reducerMap:{},effectMap:{},injectedModules:{},currentViews:{}},b}}]);return MetaData.isDev&&client&&client.__REDUX_DEVTOOLS_EXTENSION__&&h.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS)),e=createStore(f,a,compose.apply(void 0,h)),MetaData.clientStore=e,client&&("onerror"in client&&client.addEventListener("error",function(a){e.dispatch(errorAction(a))},!0),"onunhandledrejection"in client&&client.addEventListener("unhandledrejection",function(a){e.dispatch(errorAction(a.reason))},!0)),e}
//# sourceMappingURL=store.js.map