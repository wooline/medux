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
let historyActions = undefined;
let transformRoute = undefined;
export function getBrowserHistory() {
  return {
    historyActions: getBrowserRouteActions(() => historyActions),
    toUrl: buildToBrowserUrl(() => transformRoute)
  };
}
export function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions = {}, container = 'root') {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  const historyData = createHistory(history, transformRoute);
  const {
    historyProxy
  } = historyData;
  historyActions = historyData.historyActions;
  return renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container);
}
export function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions = {}, renderToStream = false) {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  const historyData = createHistory({
    listen: () => void 0,
    location: createLocation(location)
  }, transformRoute);
  const {
    historyProxy
  } = historyData;
  historyActions = historyData.historyActions;
  return renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions, renderToStream);
}
export const Switch = ({
  children,
  elseView
}) => {
  if (!children || Array.isArray(children) && children.every(item => !item)) {
    return React.createElement(React.Fragment, null, elseView);
  } else {
    return React.createElement(React.Fragment, null, children);
  }
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
  const props = Object.assign({}, rest, {
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