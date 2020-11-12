import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { routeMiddleware, routeReducer } from '@medux/route-plan-a';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter, HistoryActions } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime } from '@medux/core';
export { setRouteConfig, RouteModelHandlers as BaseModelHandlers } from '@medux/route-plan-a';
var historyActions;
export function buildApp(_ref) {
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
  historyActions = createRouter(historyType, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(routeMiddleware);

  if (!storeOptions.reducers) {
    storeOptions.reducers = {};
  }

  storeOptions.reducers.route = routeReducer;

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, function (store) {
    var _historyActions;

    var newStore = beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions
    }) : store;
    (_historyActions = historyActions) === null || _historyActions === void 0 ? void 0 : _historyActions.setStore(newStore);
    return newStore;
  });
}
export function buildSSR(_ref2) {
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
  historyActions = createRouter(location, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, function (store) {
    var _historyActions2;

    var newStore = beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions
    }) : store;
    (_historyActions2 = historyActions) === null || _historyActions2 === void 0 ? void 0 : _historyActions2.setStore(newStore);
    return newStore;
  });
}
export var Switch = function Switch(_ref3) {
  var children = _ref3.children,
      elseView = _ref3.elseView;

  if (!children || Array.isArray(children) && children.every(function (item) {
    return !item;
  })) {
    return React.createElement(React.Fragment, null, elseView);
  }

  return React.createElement(React.Fragment, null, children);
};

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export var Link = React.forwardRef(function (_ref4, ref) {
  var _onClick = _ref4.onClick,
      replace = _ref4.replace,
      rest = _objectWithoutPropertiesLoose(_ref4, ["onClick", "replace"]);

  var target = rest.target;
  var props = Object.assign(Object.assign({}, rest), {}, {
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
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});