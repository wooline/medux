import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { routeMiddleware, routeReducer } from '@medux/route-plan-a';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter, HistoryActions } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime } from '@medux/core';
export { setRouteConfig, RouteModelHandlers as BaseModelHandlers } from '@medux/route-plan-a';
let historyActions;
export function buildApp({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  historyType = 'Browser',
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  container = 'root',
  beforeRender
}) {
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
  return renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, store => {
    var _historyActions;

    const newStore = beforeRender ? beforeRender({
      store,
      historyActions: historyActions
    }) : store;
    (_historyActions = historyActions) === null || _historyActions === void 0 ? void 0 : _historyActions.setStore(newStore);
    return newStore;
  });
}
export function buildSSR({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  location,
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  renderToStream = false,
  beforeRender
}) {
  historyActions = createRouter(location, defaultRouteParams, routeRule, locationMap);

  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }

  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, store => {
    var _historyActions2;

    const newStore = beforeRender ? beforeRender({
      store,
      historyActions: historyActions
    }) : store;
    (_historyActions2 = historyActions) === null || _historyActions2 === void 0 ? void 0 : _historyActions2.setStore(newStore);
    return newStore;
  });
}
export const Switch = ({
  children,
  elseView
}) => {
  if (!children || Array.isArray(children) && children.every(item => !item)) {
    return React.createElement(React.Fragment, null, elseView);
  }

  return React.createElement(React.Fragment, null, children);
};

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export const Link = React.forwardRef((_ref, ref) => {
  let {
    onClick,
    replace
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "replace"]);

  const {
    target
  } = rest;
  const props = Object.assign(Object.assign({}, rest), {}, {
    onClick: event => {
      try {
        onClick && onClick(event);
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