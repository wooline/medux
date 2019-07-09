import"core-js/modules/es.array.concat";import"core-js/modules/es.array.filter";import"core-js/modules/es.array.iterator";import"core-js/modules/es.object.keys";import"core-js/modules/es.object.to-string";import"core-js/modules/es.promise";import"core-js/modules/es.regexp.constructor";import"core-js/modules/es.regexp.to-string";import"core-js/modules/es.string.iterator";import"core-js/modules/es.string.replace";import"core-js/modules/es.string.split";import"core-js/modules/web.dom-collections.for-each";import"core-js/modules/web.dom-collections.iterator";import _objectSpread from"@babel/runtime/helpers/esm/objectSpread";import{MetaData,NSP,client,isPromise}from"./basic";import{ActionTypes,errorAction,routeChangeAction}from"./actions";import{applyMiddleware,compose,createStore}from"redux";import{injectModel}from"./module";import{isPlainObject}from"./sprite";/**
 * dispatch push action
 * middleware 拦截并调用history.push
 * history触发侦听器，dispatch change action
 * store侦听器，判断是否时光
 */ // let invalidViewTimer: number;
// function checkInvalidview() {
//   invalidViewTimer = 0;
//   const currentViews = MetaData.clientStore._medux_.currentViews;
//   const views: DisplayViews = {};
//   for (const moduleName in currentViews) {
//     if (currentViews.hasOwnProperty(moduleName)) {
//       const element = currentViews[moduleName];
//       for (const viewname in element) {
//         if (element[viewname]) {
//           const n = Object.keys(element[viewname]).length;
//           if (n) {
//             if (!views[moduleName]) {
//               views[moduleName] = {};
//             }
//             views[moduleName][viewname] = true;
//           }
//         }
//       }
//     }
//   }
//   // MetaData.clientStore.dispatch(viewInvalidAction(views));
// }
// export function invalidview() {
//   if (MetaData.isServer) {
//     return;
//   }
//   if (!invalidViewTimer) {
//     invalidViewTimer = setTimeout(checkInvalidview, 300);
//   }
// }
// export function viewWillMount(moduleName: string, viewName: string, vid: string) {
//   if (MetaData.isServer) {
//     return;
//   }
//   const currentViews = MetaData.clientStore._medux_.currentViews;
//   if (!currentViews[moduleName]) {
//     currentViews[moduleName] = {[viewName]: {[vid]: true}};
//   } else {
//     const views = currentViews[moduleName];
//     if (!views[viewName]) {
//       views[viewName] = {[vid]: true};
//     } else {
//       views[viewName][vid] = true;
//     }
//   }
//   invalidview();
// }
// export function viewWillUnmount(moduleName: string, viewName: string, vid: string) {
//   if (MetaData.isServer) {
//     return;
//   }
//   const currentViews = MetaData.clientStore._medux_.currentViews;
//   if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
//     const views = currentViews[moduleName][viewName];
//     delete views[vid];
//   }
//   invalidview();
// }
export function getActionData(a){var b=Object.keys(a).filter(function(a){return"type"!==a&&"priority"!==a&&"time"!==a});if(0!==b.length){if(1===b.length)return a[b[0]];var c=_objectSpread({},a);return delete c.type,delete c.priority,delete c.time,c}}function bindHistory(a,b){var c=!1,d=function(d){if(!c){var e=b.locationToRouteData(d);a.dispatch(routeChangeAction({location:d,data:e}))}else c=!1};b.subscribe(d),a.subscribe(function(){var d=a.getState().route;b.isTimeTravel(d.location)&&(c=!0,b.patch(d.location,d.data))}),d(b.getLocation())}export function buildStore(a,b,c,d,e){if(void 0===b&&(b={}),void 0===c&&(c={}),void 0===d&&(d=[]),void 0===e&&(e=[]),!isPlainObject(b))throw new Error("preloadedState must be plain objects!");if(!isPlainObject(c))throw new Error("storeReducers must be plain objects!");if(c.route)throw new Error("the reducer name 'route' is not allowed");c.route=function(a,b){if(b.type===ActionTypes.F_ROUTE_CHANGE){var c=getActionData(b);return a?_objectSpread({},a,c):c}return a};var f,g=function(a,b){if(!f)return a;var d=f._medux_;d.prevState=a;var e=_objectSpread({},a);d.currentState=e,Object.keys(c).forEach(function(a){e[a]=c[a](e[a],b)});var g=d.reducerMap[b.type]||{},h=d.reducerMap[b.type.replace(new RegExp("[^"+NSP+"]+"),"*")]||{},i=_objectSpread({},g,h),j=Object.keys(i);// 支持泛监听，形如 */loading
if(0<j.length){var k=[],l=b.priority?[].concat(b.priority):[];//
j.forEach(function(a){var b=i[a];a===MetaData.appModuleName?k.unshift(a):k.push(a),b.__isHandler__||l.unshift(a)}),k.unshift.apply(k,l);var n={};k.forEach(function(a){if(!n[a]){n[a]=!0;var c=i[a];e[a]=c(getActionData(b))}})}var m=Object.keys(a).length!==Object.keys(e).length||Object.keys(a).some(function(b){return a[b]!==e[b]});return d.prevState=m?e:a,d.prevState},h=applyMiddleware.apply(void 0,[function preLoadMiddleware(){return function(a){return function(b){var c=b.type.split(NSP),d=c[0],e=c[1];if(d&&e&&MetaData.moduleGetter[d]){var g=injectModel(MetaData.moduleGetter,d,f);if(isPromise(g))return g.then(function(){return a(b)})}return a(b)}}}].concat(d,[function middleware(){return function(a){return function(b){if(MetaData.isServer&&b.type.split(NSP)[1]===ActionTypes.M_LOADING)return b;var c=a(b),d=f._medux_.effectMap[c.type]||{},e=f._medux_.effectMap[c.type.replace(new RegExp("[^"+NSP+"]+"),"*")]||{},g=_objectSpread({},d,e),h=Object.keys(g);if(0<h.length){var k=c.priority?[].concat(c.priority):[];h.forEach(function(a){var b=g[a];b.__isHandler__?k.push(a):k.unshift(a)});var i={},j=[];if(k.forEach(function(a){if(!i[a]){i[a]=!0;var b=g[a],d=b(getActionData(c)),e=b.__decorators__;if(e){var f=[];e.forEach(function(b,e){f[e]=b[0](c,a,d)}),b.__decoratorResults__=f}d.then(function(a){if(e){var c=b.__decoratorResults__||[];e.forEach(function(b,d){b[1]&&b[1]("Resolved",c[d],a)}),b.__decoratorResults__=void 0}return a},function(a){if(e){var c=b.__decoratorResults__||[];e.forEach(function(b,d){b[1]&&b[1]("Rejected",c[d],a)}),b.__decoratorResults__=void 0}}),j.push(d)}}),j.length)return Promise.all(j)}return c}}}])),i=[].concat(e,[h,function enhancer(a){return function(){var b=a.apply(void 0,arguments);return b._medux_={prevState:{router:null},currentState:{router:null},reducerMap:{},effectMap:{},injectedModules:{},currentViews:{}},b}}]);return MetaData.isDev&&client&&client.__REDUX_DEVTOOLS_EXTENSION__&&i.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS)),f=createStore(g,b,compose.apply(void 0,i)),bindHistory(f,a),MetaData.clientStore=f,client&&("onerror"in client&&client.addEventListener("error",function(a){f.dispatch(errorAction(a))},!0),"onunhandledrejection"in client&&client.addEventListener("unhandledrejection",function(a){f.dispatch(errorAction(a.reason))},!0)),f}
//# sourceMappingURL=store.js.map