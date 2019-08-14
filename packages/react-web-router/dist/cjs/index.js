"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getHistoryActions = getHistoryActions;
exports.buildApp = buildApp;
exports.buildSSR = buildSSR;
exports.reducer = exports.errorAction = exports.effect = exports.BaseModelHandlers = exports.exportActions = exports.LoadingState = exports.ActionTypes = exports.exportModule = exports.loadView = void 0;

var _web = require("@medux/web");

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _react2 = require("@medux/react");

exports.loadView = _react2.loadView;
exports.exportModule = _react2.exportModule;

var _server = require("react-dom/server");

var _reactDom = _interopRequireDefault(require("react-dom"));

var _core = require("@medux/core");

exports.ActionTypes = _core.ActionTypes;
exports.LoadingState = _core.LoadingState;
exports.exportActions = _core.exportActions;
exports.BaseModelHandlers = _core.BaseModelHandlers;
exports.effect = _core.effect;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
//TODO use StaticRouter
var historyActions = undefined;

function getHistoryActions() {
  return historyActions;
}

function buildApp(moduleGetter, appModuleName, history, transformRoute, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  var historyData = (0, _web.createHistory)(history, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  return (0, _react2.renderApp)(function (Provider, AppMainView, ssrInitStoreKey) {
    var WithRouter = (0, _reactRouterDom.withRouter)(AppMainView);

    var app = _react.default.createElement(Provider, null, _react.default.createElement(_reactRouterDom.Router, {
      history: history
    }, _react.default.createElement(WithRouter, null)));

    if (typeof container === 'function') {
      container(app);
    } else {
      var render = window[ssrInitStoreKey] ? _reactDom.default.hydrate : _reactDom.default.render;
      render(app, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}

function buildSSR(moduleGetter, appModuleName, location, transformRoute, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  var historyData = (0, _web.createHistory)({}, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyProxy.initialized = false;
  historyActions = historyData.historyActions;
  var render = renderToStream ? _server.renderToNodeStream : _server.renderToString;
  return (0, _react2.renderSSR)(function (Provider, AppMainView) {
    return render(_react.default.createElement(Provider, null, _react.default.createElement(_reactRouterDom.StaticRouter, {
      location: location
    }, _react.default.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map