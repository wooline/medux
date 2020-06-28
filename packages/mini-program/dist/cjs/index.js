"use strict";

exports.__esModule = true;
exports.initApp = initApp;
exports.exportModule = void 0;

require("./env");

var _core = require("@medux/core");

var _history = require("./history");

var _routePlanA = require("@medux/route-plan-a");

var exportModule = _core.exportModule;
exports.exportModule = exportModule;
var historyActions = undefined;
var transformRoute = undefined;
var toBrowserUrl = undefined;

function checkRedirect(views) {
  if (views['@']) {
    var url = Object.keys(views['@'])[0];
    historyActions.navigateTo(url);
    return true;
  }

  return false;
}

var redirectMiddleware = function redirectMiddleware() {
  return function (next) {
    return function (action) {
      if (action.type === _core.ActionTypes.RouteChange) {
        var routeState = action.payload[0];
        var views = routeState.data.views;

        if (checkRedirect(views)) {
          return;
        }
      }

      return next(action);
    };
  };
};

function initApp(_ref) {
  var startupUrl = _ref.startupUrl,
      moduleGetter = _ref.moduleGetter,
      appModule = _ref.appModule,
      _ref$routeConfig = _ref.routeConfig,
      routeConfig = _ref$routeConfig === void 0 ? {} : _ref$routeConfig,
      locationMap = _ref.locationMap,
      defaultRouteParams = _ref.defaultRouteParams,
      _ref$storeOptions = _ref.storeOptions,
      storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions;
  (0, _routePlanA.setRouteConfig)({
    defaultRouteParams: defaultRouteParams
  });
  var router = (0, _history.createRouter)(routeConfig, startupUrl, locationMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(redirectMiddleware);
  var reduxStore = undefined;
  (0, _core.renderApp)(function () {
    return function () {
      return void 0;
    };
  }, moduleGetter, appModule, router.historyProxy, storeOptions, function (store) {
    var storeState = store.getState();
    var views = storeState.route.data.views;
    checkRedirect(views);
    reduxStore = store;
    return store;
  });
  return {
    store: reduxStore,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl,
    transformRoute: transformRoute
  };
}