'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'));
var _objectWithoutPropertiesLoose = _interopDefault(require('@babel/runtime/helpers/objectWithoutPropertiesLoose'));
var core = require('@medux/core');
var React = require('react');
var React__default = _interopDefault(React);
var server = require('react-dom/server');
var reactRedux = require('react-redux');
var ReactDOM = _interopDefault(require('react-dom'));

function renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container, beforeRender) {
  if (container === void 0) {
    container = 'root';
  }

  return core.renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var reduxProvider = React__default.createElement(reactRedux.Provider, {
      store: store
    }, React__default.createElement(appViews.Main, null));

    if (typeof container === 'function') {
      container(reduxProvider);
    } else {
      var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(reduxProvider, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
}
function renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions, renderToStream, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  return core.renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();
    var reduxProvider = React__default.createElement(reactRedux.Provider, {
      store: store
    }, React__default.createElement(appViews.Main, null));
    var render = renderToStream ? server.renderToNodeStream : server.renderToString;
    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(reduxProvider)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
}
var loadView = function loadView(moduleName, viewName, options, Loading) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef,
      modelOptions = _objectWithoutPropertiesLoose(_ref, ["forwardRef"]);

  var Loader = function ViewLoader(props) {
    var _useState = React.useState(function () {
      var moduleViewResult = core.getView(moduleName, viewName, modelOptions);

      if (core.isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef = props.forwardRef,
        other = _objectWithoutPropertiesLoose(props, ["forwardRef"]);

    var ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? React__default.createElement(view.Component, _extends({}, other, ref)) : Loading ? React__default.createElement(Loading, props) : null;
  };

  var Component = forwardRef ? React__default.forwardRef(function (props, ref) {
    return React__default.createElement(Loader, _extends({}, props, {
      forwardRef: ref
    }));
  }) : Loader;
  return Component;
};
var exportModule = core.exportModule;

exports.exportModule = exportModule;
exports.loadView = loadView;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;
