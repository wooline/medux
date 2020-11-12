"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.buildApp = buildApp;
exports.buildSSR = buildSSR;
exports.Link = exports.Switch = exports.BaseModelHandlers = exports.setRouteConfig = exports.setLoadingDepthTime = exports.logger = exports.setConfig = exports.setLoading = exports.viewHotReplacement = exports.reducer = exports.errorAction = exports.effect = exports.modelHotReplacement = exports.exportActions = exports.LoadingState = exports.delayPromise = exports.ActionTypes = exports.exportModule = exports.loadView = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _routePlanA = require("@medux/route-plan-a");

exports.setRouteConfig = _routePlanA.setRouteConfig;
exports.BaseModelHandlers = _routePlanA.RouteModelHandlers;

var _react = _interopRequireDefault(require("react"));

var _react2 = require("@medux/react");

exports.loadView = _react2.loadView;
exports.exportModule = _react2.exportModule;

var _web = require("@medux/web");

var _core = require("@medux/core");

exports.ActionTypes = _core.ActionTypes;
exports.delayPromise = _core.delayPromise;
exports.LoadingState = _core.LoadingState;
exports.exportActions = _core.exportActions;
exports.modelHotReplacement = _core.modelHotReplacement;
exports.effect = _core.effect;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
exports.viewHotReplacement = _core.viewHotReplacement;
exports.setLoading = _core.setLoading;
exports.setConfig = _core.setConfig;
exports.logger = _core.logger;
exports.setLoadingDepthTime = _core.setLoadingDepthTime;
var historyActions;

function buildApp(_ref) {
  var moduleGetter = _ref.moduleGetter,
      _ref$appModuleName = _ref.appModuleName,
      appModuleName = _ref$appModuleName === void 0 ? 'app' : _ref$appModuleName,
      _ref$appViewName = _ref.appViewName,
      appViewName = _ref$appViewName === void 0 ? 'main' : _ref$appViewName,
      _ref$historyType = _ref.historyType,
      historyType = _ref$historyType === void 0 ? 'Browser' : _ref$historyType,
      _ref$routeRule = _ref.routeRule,
      routeRule = _ref$routeRule === void 0 ? {} : _ref$routeRule,
      locationMap = _ref.locationMap,
      _ref$defaultRoutePara = _ref.defaultRouteParams,
      defaultRouteParams = _ref$defaultRoutePara === void 0 ? {} : _ref$defaultRoutePara,
      _ref$storeOptions = _ref.storeOptions,
      storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions,
      _ref$container = _ref.container,
      container = _ref$container === void 0 ? 'root' : _ref$container,
      beforeRender = _ref.beforeRender;
  historyActions = (0, _web.createRouter)(historyType, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(_routePlanA.routeMiddleware);

  if (!storeOptions.reducers) {
    storeOptions.reducers = {};
  }

  storeOptions.reducers.route = _routePlanA.routeReducer;

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return (0, _react2.renderApp)(moduleGetter, appModuleName, appViewName, storeOptions, container, function (store) {
    var _historyActions;

    var newStore = beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions
    }) : store;
    (_historyActions = historyActions) === null || _historyActions === void 0 ? void 0 : _historyActions.setStore(newStore);
    return newStore;
  });
}

function buildSSR(_ref2) {
  var moduleGetter = _ref2.moduleGetter,
      _ref2$appModuleName = _ref2.appModuleName,
      appModuleName = _ref2$appModuleName === void 0 ? 'app' : _ref2$appModuleName,
      _ref2$appViewName = _ref2.appViewName,
      appViewName = _ref2$appViewName === void 0 ? 'main' : _ref2$appViewName,
      location = _ref2.location,
      _ref2$routeRule = _ref2.routeRule,
      routeRule = _ref2$routeRule === void 0 ? {} : _ref2$routeRule,
      locationMap = _ref2.locationMap,
      _ref2$defaultRoutePar = _ref2.defaultRouteParams,
      defaultRouteParams = _ref2$defaultRoutePar === void 0 ? {} : _ref2$defaultRoutePar,
      _ref2$storeOptions = _ref2.storeOptions,
      storeOptions = _ref2$storeOptions === void 0 ? {} : _ref2$storeOptions,
      _ref2$renderToStream = _ref2.renderToStream,
      renderToStream = _ref2$renderToStream === void 0 ? false : _ref2$renderToStream,
      beforeRender = _ref2.beforeRender;
  historyActions = (0, _web.createRouter)(location, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return (0, _react2.renderSSR)(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, function (store) {
    var _historyActions2;

    var newStore = beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions
    }) : store;
    (_historyActions2 = historyActions) === null || _historyActions2 === void 0 ? void 0 : _historyActions2.setStore(newStore);
    return newStore;
  });
}

var Switch = function Switch(_ref3) {
  var children = _ref3.children,
      elseView = _ref3.elseView;

  if (!children || Array.isArray(children) && children.every(function (item) {
    return !item;
  })) {
    return _react.default.createElement(_react.default.Fragment, null, elseView);
  }

  return _react.default.createElement(_react.default.Fragment, null, children);
};

exports.Switch = Switch;

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

var Link = _react.default.forwardRef(function (_ref4, ref) {
  var _onClick = _ref4.onClick,
      replace = _ref4.replace,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref4, ["onClick", "replace"]);
  var target = rest.target;
  var props = Object.assign({}, rest, {
    onClick: function onClick(event) {
      try {
        _onClick && _onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? historyActions.replace(rest.href) : historyActions.push(rest.href);
        }
    }
  });
  return _react.default.createElement("a", (0, _extends2.default)({}, props, {
    ref: ref
  }));
});

exports.Link = Link;