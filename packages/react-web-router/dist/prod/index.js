import{createHistory}from"@medux/web";import React from"react";import{Router,withRouter}from"react-router-dom";import{renderApp,renderSSR}from"@medux/react";import{renderToNodeStream,renderToString}from"react-dom/server";import ReactDOM from"react-dom";//TODO use StaticRouter
export{loadView,exportModule}from"@medux/react";export{ActionTypes,LoadingState,exportActions,BaseModelHandlers,effect,reducer}from"@medux/core";export var historyActions=null;export function buildApp(a,b,c,d,e){void 0===d&&(d={}),void 0===e&&(e="root");var f=createHistory(c),g=f.history,h=f.historyProxy;// // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
// let routerInited = false;
// const filterRouter = () => (next: Function) => (action: {type: string}) => {
//   if (action.type === '@@router/LOCATION_CHANGE') {
//     if (!routerInited) {
//       routerInited = true;
//       return action;
//     } else {
//       invalidview();
//     }
//   }
//   return next(action);
// };
// storeOptions.middlewares = storeOptions.middlewares || [];
// storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));
return historyActions=f.historyActions,renderApp(function(a,b,c){var d=withRouter(b),f=React.createElement(a,null,React.createElement(Router,{history:g},React.createElement(d,null)));if("function"==typeof e)e(f);else{var h=window[c]?ReactDOM.hydrate:ReactDOM.render;h(f,"string"==typeof e?document.getElementById(e):e)}},a,b,h,d)}export function buildSSR(a,b,c,d,e){void 0===d&&(d={}),void 0===e&&(e=!1);var f=createHistory(c),g=f.history,h=f.historyProxy;historyActions=f.historyActions;// storeOptions.reducers = storeOptions.reducers || {};
// if (storeOptions.reducers && storeOptions.reducers.router) {
//   throw new Error("the reducer name 'router' is not allowed");
// }
// const router = connectRouter(history);
// storeOptions.reducers.router = (state, action) => {
//   const routerData = router(state.router, action as any);
//   if (storeOptions.routerParser && state.router !== routerData) {
//     state.router = storeOptions.routerParser(routerData, state.router);
//   } else {
//     state.router = routerData;
//   }
// };
// let routerInited = false;
// const filterRouter = () => (next: Function) => (action: {type: string}) => {
//   if (action.type === '@@router/LOCATION_CHANGE') {
//     if (!routerInited) {
//       routerInited = true;
//       return action;
//     } else {
//       invalidview();
//     }
//   }
//   return next(action);
// };
// storeOptions.middlewares = storeOptions.middlewares || [];
// storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));
var i=e?renderToNodeStream:renderToString;return renderSSR(function(a,b){return i(React.createElement(a,null,React.createElement(Router,{history:g},React.createElement(b,null))))},a,b,h,d)}
//# sourceMappingURL=index.js.map