import React,{useState,useEffect}from"react";import ReactDOM from"react-dom";import{renderToNodeStream,renderToString}from"react-dom/server";import{Provider}from"react-redux";import{createBrowserHistory,createMemoryHistory}from"history";import{withRouter}from"react-router-dom";import{ConnectedRouter,connectRouter,routerMiddleware}from"connected-react-router";import{renderApp,renderSSR,getView,isPromiseView,viewWillMount,viewWillUnmount,isServer,getClientStore,exportModule as baseExportModule}from"@medux/core";export function buildApp(a,b,c,d){void 0===c&&(c={}),void 0===d&&(d="root");var e=createBrowserHistory();if(c.reducers=c.reducers||{},c.reducers&&c.reducers.router)throw new Error("the reducer name 'router' is not allowed");var f=connectRouter(e);return c.reducers.router=function(a,b){var d=f(a.router,b);a.router=c.routerParser&&a.router!==d?c.routerParser(d,a.router):d},c.middlewares=c.middlewares||[],c.middlewares.unshift(routerMiddleware(e)),renderApp(function(a,b,c,f){var g=withRouter(c.Main),h=React.createElement(Provider,{store:a},React.createElement(ConnectedRouter,{history:e},React.createElement(g,null)));if("function"==typeof d)d(h);else{var i=window[f]?ReactDOM.hydrate:ReactDOM.render;i(h,"string"==typeof d?document.getElementById(d):d)}},a,b,c)}export function buildSSR(a,b,c,d,e){void 0===d&&(d={}),void 0===e&&(e=!1);var f=createMemoryHistory({initialEntries:c});if(d.reducers=d.reducers||{},d.reducers&&d.reducers.router)throw new Error("the reducer name 'router' is not allowed");var g=connectRouter(f);d.reducers.router=function(a,b){var c=g(a.router,b);a.router=d.routerParser&&a.router!==c?d.routerParser(c,a.router):c},d.middlewares=d.middlewares||[],d.middlewares.unshift(routerMiddleware(f));var h=e?renderToNodeStream:renderToString;return renderSSR(function(a,b,c,d){var e=a.getState();return{ssrInitStoreKey:d,data:e,html:h(React.createElement(Provider,{store:a},React.createElement(ConnectedRouter,{history:f},React.createElement(c.Main,null))))}},a,b,d)}export var loadView=function(a,b,c,d){return function(e){var f=useState(function(){var d=getView(a[b],c);return isPromiseView(d)?(d.then(function(a){h(a)}),null):d}),g=f[0],h=f[1];return g?React.createElement(g,e):d?React.createElement(d,e):null}};function exportView(a,b,c,d){if(isServer())return a;var e=function(e){var f=useState(function(){var a=getClientStore().getState(),c=b.moduleName;return b(getClientStore()).then(function(){g||h(!0)}),!!a[c]}),g=f[0],h=f[1];return useEffect(function(){return viewWillMount(b.moduleName,c),function(){viewWillUnmount(b.moduleName,c)}},[]),g?React.createElement(a,e):d?React.createElement(d,e):null};return e.propTypes=a.propTypes,e.contextTypes=a.contextTypes,e.defaultProps=a.defaultProps,e}export var exportModule=function(a,b,c,d,e){var f=baseExportModule(a,b,c,d),g={};for(var h in f.views)f.views.hasOwnProperty(h)&&(g[h]=exportView(f.views[h],f.model,h,e));return f.views=g,f};
//# sourceMappingURL=index.js.map