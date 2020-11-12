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

function renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, beforeRender) {
  if (container === void 0) {
    container = 'root';
  }

  return core.renderApp(function (store, appModel, AppView, ssrInitStoreKey) {
    var reRender = function reRender(View) {
      var reduxProvider = _react.default.createElement(_reactRedux.Provider, {
        store: store
      }, _react.default.createElement(View, null));

      if (typeof container === 'function') {
        container(reduxProvider);
      } else {
        var panel = typeof container === 'string' ? core.env.document.getElementById(container) : container;

        _reactDom.default.unmountComponentAtNode(panel);

        var render = core.env[ssrInitStoreKey] ? _reactDom.default.hydrate : _reactDom.default.render;
        render(reduxProvider, panel);
      }
    };

    reRender(AppView);
    return reRender;
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}

function renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  return core.renderSSR(function (store, appModel, AppView, ssrInitStoreKey) {
    var data = store.getState();

    var reduxProvider = _react.default.createElement(_reactRedux.Provider, {
      store: store
    }, _react.default.createElement(AppView, null));

    var render = renderToStream ? _server.renderToNodeStream : _server.renderToString;
    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(reduxProvider)
    };
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}

var LoadViewOnError = function LoadViewOnError() {
  return _react.default.createElement("div", null, "error");
};

var loadView = function loadView(moduleName, viewName, options, Loading, Error) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef;

  var active = true;

  var Loader = function ViewLoader(props) {
    (0, _react.useEffect)(function () {
      return function () {
        active = false;
      };
    }, []);

    var _useState = (0, _react.useState)(function () {
      var moduleViewResult = (0, core.getView)(moduleName, viewName);

      if ((0, core.isPromise)(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          active && setView({
            Component: Component
          });
        }).catch(function () {
          active && setView({
            Component: Error || LoadViewOnError
          });
        });
        return null;
      }

      return {
        Component: moduleViewResult
      };
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef2 = props.forwardRef2,
        other = (0, _objectWithoutPropertiesLoose2.default)(props, ["forwardRef2"]);
    var ref = forwardRef ? {
      ref: forwardRef2
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