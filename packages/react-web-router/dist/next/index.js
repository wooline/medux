import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { setRouteConfig } from '@medux/route-plan-a';
import { createLocation } from 'history';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
let historyActions = undefined;
let transformRoute = undefined;
let toBrowserUrl = undefined;
export function buildApp({
  moduleGetter,
  appModuleName,
  history,
  routeConfig = {},
  defaultRouteParams,
  storeOptions = {},
  container = 'root',
  beforeRender
}) {
  setRouteConfig({
    defaultRouteParams
  });
  const router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderApp(moduleGetter, appModuleName, router.historyProxy, storeOptions, container, store => {
    const storeState = store.getState();
    const {
      views
    } = storeState.route.data;

    if (views['@']) {
      const url = Object.keys(views['@'])[0];
      historyActions.replace(url);
    }

    return beforeRender ? beforeRender({
      store,
      history,
      historyActions: historyActions,
      toBrowserUrl: toBrowserUrl,
      transformRoute: transformRoute
    }) : store;
  });
}
export function buildSSR({
  moduleGetter,
  appModuleName,
  location,
  routeConfig = {},
  defaultRouteParams,
  storeOptions = {},
  renderToStream = false,
  beforeRender
}) {
  setRouteConfig({
    defaultRouteParams
  });
  const history = {
    listen: () => void 0,
    location: createLocation(location)
  };
  const router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, router.historyProxy, storeOptions, renderToStream, store => {
    const storeState = store.getState();
    const {
      views
    } = storeState.route.data;

    if (views['@']) {
      const url = Object.keys(views['@'])[0];
      throw {
        code: '301',
        message: url,
        detail: url
      };
    }

    return beforeRender ? beforeRender({
      store,
      history,
      historyActions: historyActions,
      toBrowserUrl: toBrowserUrl,
      transformRoute: transformRoute
    }) : store;
  });
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