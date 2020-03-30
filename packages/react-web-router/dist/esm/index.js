import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { createLocation } from 'history';
import { buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions } from '@medux/route-plan-a';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createHistory } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
var historyActions = undefined;
var transformRoute = undefined;
export function getBrowserHistory() {
  return {
    historyActions: getBrowserRouteActions(function () {
      return historyActions;
    }),
    toUrl: buildToBrowserUrl(function () {
      return transformRoute;
    })
  };
}
export function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory(history, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  return renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container);
}
export function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory({
    listen: function listen() {
      return void 0;
    },
    location: createLocation(location)
  }, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  return renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions, renderToStream);
}
export var Switch = function Switch(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;

  if (!children || Array.isArray(children) && children.every(function (item) {
    return !item;
  })) {
    return React.createElement(React.Fragment, null, elseView);
  } else {
    return React.createElement(React.Fragment, null, children);
  }
};

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export var Link = React.forwardRef(function (_ref2, ref) {
  var _onClick = _ref2.onClick,
      replace = _ref2.replace,
      rest = _objectWithoutPropertiesLoose(_ref2, ["onClick", "replace"]);

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
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});