import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { setRouteConfig } from '@medux/route-plan-a';
import { ActionTypes } from '@medux/core';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
let historyActions = undefined;
let transformRoute = undefined;
let toBrowserUrl = undefined;

function checkRedirect(views, throwError) {
  if (views['@']) {
    const url = Object.keys(views['@'])[0];

    if (throwError) {
      throw {
        code: '301',
        message: url,
        detail: url
      };
    } else {
      historyActions.replace(url);
    }

    return true;
  }

  return false;
}

const redirectMiddleware = () => next => action => {
  if (action.type === ActionTypes.RouteChange) {
    const routeState = action.payload[0];
    const {
      views
    } = routeState.data;

    if (checkRedirect(views)) {
      return;
    }
  }

  return next(action);
};

export function buildApp({
  moduleGetter,
  appModuleName,
  history,
  routeConfig = {},
  pathnameMap,
  defaultRouteParams,
  storeOptions = {},
  container = 'root',
  beforeRender
}) {
  setRouteConfig({
    defaultRouteParams
  });
  const router = createRouter(history, routeConfig, pathnameMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(moduleGetter, appModuleName, router.historyProxy, storeOptions, container, store => {
    const storeState = store.getState();
    const {
      views
    } = storeState.route.data;
    checkRedirect(views);
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
  const [pathname, search = ''] = location.split('?');
  const history = {
    listen: () => void 0,
    location: {
      pathname,
      search: search && '?' + search,
      hash: ''
    }
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
    checkRedirect(views, true);
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