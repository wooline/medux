"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;
exports.exportModule = exports.loadView = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var core = _interopRequireWildcard(require("@medux/core"));

var _react = _interopRequireWildcard(require("react"));

var _server = require("react-dom/server");

var _reactRedux = require("react-redux");

var _reactDom = _interopRequireDefault(require("react-dom"));

function renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container, beforeRender) {
  if (container === void 0) {
    container = 'root';
  }

  return core.renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var reduxProvider = _react.default.createElement(_reactRedux.Provider, {
      store: store
    }, _react.default.createElement(appViews.Main, null));

    if (typeof container === 'function') {
      container(reduxProvider);
    } else {
      var render = window[ssrInitStoreKey] ? _reactDom.default.hydrate : _reactDom.default.render;
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

    var reduxProvider = _react.default.createElement(_reactRedux.Provider, {
      store: store
    }, _react.default.createElement(appViews.Main, null));

    var render = renderToStream ? _server.renderToNodeStream : _server.renderToString;
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
      modelOptions = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["forwardRef"]);

  var Loader = function ViewLoader(props) {
    var _useState = (0, _react.useState)(function () {
      var moduleViewResult = (0, core.getView)(moduleName, viewName, modelOptions);

      if ((0, core.isPromiseView)(moduleViewResult)) {
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
        other = (0, _objectWithoutPropertiesLoose2.default)(props, ["forwardRef"]);
    var ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? _react.default.createElement(view.Component, (0, _extends2.default)({}, other, ref)) : Loading ? _react.default.createElement(Loading, props) : null;
  };

  var Component = forwardRef ? _react.default.forwardRef(function (props, ref) {
    return _react.default.createElement(Loader, (0, _extends2.default)({}, props, {
      forwardRef: ref
    }));
  }) : Loader;
  return Component;
};

exports.loadView = loadView;
var exportModule = core.exportModule;
exports.exportModule = exportModule;