import{ConnectedRouter,connectRouter,routerMiddleware}from"connected-react-router";import React,{useEffect,useState}from"react";import{exportModule as baseExportModule,getView,invalidview,isPromiseView,renderApp,renderSSR,viewWillMount,viewWillUnmount}from"@medux/core";import{createBrowserHistory,createMemoryHistory}from"history";import{renderToNodeStream,renderToString}from"react-dom/server";import{Provider}from"react-redux";import ReactDOM from"react-dom";import{withRouter}from"react-router-dom";export{routerActions}from"connected-react-router";export function buildApp(a,b,c,d){void 0===c&&(c={}),void 0===d&&(d="root");var e=createBrowserHistory();if(c.reducers=c.reducers||{},c.reducers&&c.reducers.router)throw new Error("the reducer name 'router' is not allowed");var f=connectRouter(e);c.reducers.router=function(a,b){var d=f(a,b);return c.routerParser&&a!==d?c.routerParser(d,a):d};// SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
var g=!1;return c.middlewares=c.middlewares||[],c.middlewares.unshift(function filterRouter(){return function(a){return function(b){if("@@router/LOCATION_CHANGE"===b.type){if(!g)return g=!0,b;invalidview()}return a(b)}}},routerMiddleware(e)),renderApp(function(a,b,c,f){var g=withRouter(c.Main),h=React.createElement(Provider,{store:a},React.createElement(ConnectedRouter,{history:e},React.createElement(g,null)));if("function"==typeof d)d(h);else{var i=window[f]?ReactDOM.hydrate:ReactDOM.render;i(h,"string"==typeof d?document.getElementById(d):d)}},a,b,c)}export function buildSSR(a,b,c,d,e){void 0===d&&(d={}),void 0===e&&(e=!1);var f=createMemoryHistory({initialEntries:c});if(d.reducers=d.reducers||{},d.reducers&&d.reducers.router)throw new Error("the reducer name 'router' is not allowed");var g=connectRouter(f);d.reducers.router=function(a,b){var c=g(a.router,b);a.router=d.routerParser&&a.router!==c?d.routerParser(c,a.router):c};var h=!1;d.middlewares=d.middlewares||[],d.middlewares.unshift(function filterRouter(){return function(a){return function(b){if("@@router/LOCATION_CHANGE"===b.type){if(!h)return h=!0,b;invalidview()}return a(b)}}},routerMiddleware(f));var i=e?renderToNodeStream:renderToString;return renderSSR(function(a,b,c,d){var e=a.getState();return{ssrInitStoreKey:d,data:e,html:i(React.createElement(Provider,{store:a},React.createElement(ConnectedRouter,{history:f},React.createElement(c.Main,null))))}},a,b,d)}export var loadView=function(a,b,c,d){var e=function(f){var g=useState(function(){var d=getView(a,b,c);return isPromiseView(d)?(d.then(function(a){e.propTypes=a.propTypes,e.contextTypes=a.contextTypes,e.defaultProps=a.defaultProps,i({Component:a})}),null):(e.propTypes=d.propTypes,e.contextTypes=d.contextTypes,e.defaultProps=d.defaultProps,{Component:d})}),h=g[0],i=g[1];return useEffect(function(){return h?(viewWillMount(b,c),function(){viewWillUnmount(b,c)}):void 0},[h]),h?React.createElement(h.Component,f):d?React.createElement(d,f):null};return e};export var exportModule=baseExportModule;
//# sourceMappingURL=index.js.map