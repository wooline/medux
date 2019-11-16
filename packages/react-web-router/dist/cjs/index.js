"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getBrowserHistory = getBrowserHistory;
exports.buildApp = buildApp;
exports.buildSSR = buildSSR;
exports.setRouteConfig = exports.reducer = exports.errorAction = exports.effect = exports.BaseModelHandlers = exports.exportActions = exports.LoadingState = exports.delayPromise = exports.ActionTypes = exports.exportModule = exports.loadView = void 0;

var _history = require("history");

var _routePlanA = require("@medux/route-plan-a");

exports.setRouteConfig = _routePlanA.setRouteConfig;

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _react2 = require("@medux/react");

exports.loadView = _react2.loadView;
exports.exportModule = _react2.exportModule;

var _server = require("react-dom/server");

var _reactDom = _interopRequireDefault(require("react-dom"));

var _web = require("@medux/web");

var _core = require("@medux/core");

exports.ActionTypes = _core.ActionTypes;
exports.delayPromise = _core.delayPromise;
exports.LoadingState = _core.LoadingState;
exports.exportActions = _core.exportActions;
exports.BaseModelHandlers = _core.BaseModelHandlers;
exports.effect = _core.effect;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
var historyActions = undefined;
var transformRoute = undefined;

function getBrowserHistory() {
  return {
    historyActions: (0, _routePlanA.getBrowserRouteActions)(function () {
      return historyActions;
    }),
    toUrl: (0, _routePlanA.buildToBrowserUrl)(function () {
      return transformRoute;
    })
  };
}

function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  if (!transformRoute) {
    transformRoute = (0, _routePlanA.buildTransformRoute)(routeConfig);
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

function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  if (!transformRoute) {
    transformRoute = (0, _routePlanA.buildTransformRoute)(routeConfig);
  }

  var historyData = (0, _web.createHistory)({
    listen: function listen() {
      return void 0;
    },
    location: (0, _history.createLocation)(location)
  }, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  var render = renderToStream ? _server.renderToNodeStream : _server.renderToString;
  return (0, _react2.renderSSR)(function (Provider, AppMainView) {
    return render(_react.default.createElement(Provider, null, _react.default.createElement(_reactRouterDom.StaticRouter, {
      location: location
    }, _react.default.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map