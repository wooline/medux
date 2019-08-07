import _assertThisInitialized from"@babel/runtime/helpers/esm/assertThisInitialized";import _inheritsLoose from"@babel/runtime/helpers/esm/inheritsLoose";import _defineProperty from"@babel/runtime/helpers/esm/defineProperty";import React from"react";import{exportModule as baseExportModule,renderApp as baseRenderApp,renderSSR as baseRenderSSR,getView,isPromiseView}from"@medux/core";import{Provider}from"react-redux";export function renderApp(a,b,c,d,e){return baseRenderApp(function(b,c,d,e){a(function ReduxProvider(a){// eslint-disable-next-line react/prop-types
return React.createElement(Provider,{store:b},a.children)},d.Main,e)},b,c,d,e)}export function renderSSR(a,b,c,d,e){return void 0===e&&(e={}),baseRenderSSR(function(b,c,d,e){var f=b.getState();return{ssrInitStoreKey:e,data:f,html:a(function ReduxProvider(a){// eslint-disable-next-line react/prop-types
return React.createElement(Provider,{store:b},a.children)},d.Main)}},b,c,d,e)}export var loadView=function(a,b,c,d){var e;return e=/*#__PURE__*/function(e){function f(){for(var a,b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];return a=e.call.apply(e,[this].concat(c))||this,_defineProperty(_assertThisInitialized(a),"state",{Component:null}),a}_inheritsLoose(f,e);var g=f.prototype;return g.componentDidMount=function componentDidMount(){var d=this,e=getView(a,b,c);isPromiseView(e)?e.then(function(a){Object.keys(f).forEach(function(b){return a[b]=f[b]}),Object.keys(a).forEach(function(b){return f[b]=a[b]}),d.setState({Component:a})}):(Object.keys(f).forEach(function(a){return e[a]=f[a]}),Object.keys(e).forEach(function(a){return f[a]=e[a]}),this.setState({Component:e}))},g.render=function render(){var a=this.state.Component;return a?React.createElement(a,this.props):d?React.createElement(d,this.props):null},f}(React.Component),e};export var exportModule=baseExportModule;
//# sourceMappingURL=index.js.map