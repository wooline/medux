import"core-js/modules/es.array.filter";import"core-js/modules/es.array.iterator";import"core-js/modules/es.array.map";import"core-js/modules/es.object.get-own-property-descriptor";import"core-js/modules/es.object.keys";import"core-js/modules/es.object.to-string";import"core-js/modules/es.promise";import"core-js/modules/es.string.iterator";import"core-js/modules/web.dom-collections.iterator";import _objectSpread from"@babel/runtime/helpers/esm/objectSpread";import _createClass from"@babel/runtime/helpers/esm/createClass";import _applyDecoratedDescriptor from"@babel/runtime/helpers/esm/applyDecoratedDescriptor";var _class,_temp;import{reducer,getModuleActionCreatorList,isPromise,injectActions,MetaData}from"./basic";import{buildStore}from"./store";import{errorAction}from"./actions";export function exportModule(a){var b=getModuleActionCreatorList(a);return{namespace:a,actions:b}}export var BaseModuleHandlers=(_class=(_temp=/*#__PURE__*/function(){// eslint-disable-next-line @typescript-eslint/no-unused-vars
function a(a){this.initState=void 0,this.namespace="",this.store=null,this.actions=null,a.isModule=!0,this.initState=a}var b=a.prototype;return b.dispatch=function dispatch(a){return this.store.dispatch(a)},b.callThisAction=function callThisAction(a){var b=getModuleActionCreatorList(this.namespace);return b[a.__actionName__](1>=arguments.length?void 0:arguments[1])},b.INIT=function INIT(a){return a},b.UPDATE=function UPDATE(a){return a},b.LOADING=function LOADING(a){var b=this.state;return b?_objectSpread({},b,{loading:_objectSpread({},b.loading,a)}):b},b.updateState=function updateState(a){this.dispatch(this.callThisAction(this.UPDATE,_objectSpread({},this.state,a)))},_createClass(a,[{key:"state",get:function get(){return this.store._medux_.prevState[this.namespace]}},{key:"rootState",get:function get(){return this.store._medux_.prevState}},{key:"currentState",get:function get(){return this.store._medux_.currentState[this.namespace]}},{key:"currentRootState",get:function get(){return this.store._medux_.currentState}}]),a}(),_temp),_applyDecoratedDescriptor(_class.prototype,"INIT",[reducer],Object.getOwnPropertyDescriptor(_class.prototype,"INIT"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"UPDATE",[reducer],Object.getOwnPropertyDescriptor(_class.prototype,"UPDATE"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"LOADING",[reducer],Object.getOwnPropertyDescriptor(_class.prototype,"LOADING"),_class.prototype),_class);export function exportModel(a,b,c){var d=function(d){var e=d._medux_.injectedModules[a];if(!e){d._medux_.injectedModules[a]=!0;var f=d.getState()[a],g=new b(c,f);g.namespace=a,g.store=d;var j=injectActions(d,a,g);if(g.actions=j,!f){var h=j.INIT(g.initState),i=d.dispatch(h);return isPromise(i)?i:Promise.resolve(void 0)}return Promise.resolve(void 0)}return Promise.resolve(void 0)};return d.namespace=a,d.initState=c,d}export function isPromiseModule(a){return"function"==typeof a.then}export function isPromiseView(a){return"function"==typeof a.then}export function loadModel(a){var b=a();return isPromiseModule(b)?b.then(function(a){return a.model}):Promise.resolve(b.model)}export function getView(a,b){var c=a();return isPromiseModule(c)?c.then(function(a){return a.views[b]}):c.views[b]}function getModuleByName(a,b){var c=b[a]();return isPromiseModule(c)?c.then(function(c){return b[a]=function(){return c},c}):c}function getModuleListByNames(a,b){var c=a.map(function(a){var c=getModuleByName(a,b);return isPromiseModule(c)?c:Promise.resolve(c)});return Promise.all(c)}export function renderApp(a,b,c,d){void 0===d&&(d={}),MetaData.appModuleName=c;var e=d.ssrInitStoreKey||"meduxInitStore",f={};(d.initData||window[e])&&(f=_objectSpread({},window[e],d.initData));var g=buildStore(f,d.reducers,d.middlewares,d.enhancers),h=[c];return f&&h.push.apply(h,Object.keys(f).filter(function(a){return a!==c&&f[a].isModule})),getModuleListByNames(h,b).then(function(b){var c=b[0],d=c.model(g);return a(g,c.model,c.views,e),d})}export function renderSSR(a,b,c,d){void 0===d&&(d={}),MetaData.appModuleName=c;var e=d.ssrInitStoreKey||"meduxInitStore",f=buildStore(d.initData,d.reducers,d.middlewares,d.enhancers),g=b[c]();return g.model(f).catch(function(a){return f.dispatch(errorAction(a))}).then(function(){return a(f,g.model,g.views,e)})}
//# sourceMappingURL=module.js.map