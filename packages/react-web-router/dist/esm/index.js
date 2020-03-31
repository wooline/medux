import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { createLocation } from 'history';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
var historyActions = undefined;
var transformRoute = undefined;
var toBrowserUrl = undefined;
export function getBrowserRouter() {
  return {
    transformRoute: {
      locationToRoute: function locationToRoute() {
        var _ref;

        return (_ref = transformRoute).locationToRoute.apply(_ref, arguments);
      },
      routeToLocation: function routeToLocation() {
        var _ref2;

        return (_ref2 = transformRoute).routeToLocation.apply(_ref2, arguments);
      }
    },
    historyActions: {
      push: function push(data) {
        return historyActions.push(data);
      },
      replace: function replace(data) {
        return historyActions.replace(data);
      },
      go: function go(n) {
        return historyActions.go(n);
      },
      goBack: function goBack() {
        return historyActions.goBack();
      },
      goForward: function goForward() {
        return historyActions.goForward();
      }
    },
    toUrl: function toUrl() {
      return toBrowserUrl.apply(void 0, arguments);
    }
  };
}
export function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions, container, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  var router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderApp(moduleGetter, appModuleName, router.historyProxy, storeOptions, container, function (store) {
    var storeState = store.getState();
    var _storeState$route$dat = storeState.route.data,
        paths = _storeState$route$dat.paths,
        views = _storeState$route$dat.views;
    console.log({
      paths: paths,
      views: views
    });
    return beforeRender ? beforeRender({
      store: store,
      history: history,
      historyActions: historyActions,
      toBrowserUrl: toBrowserUrl,
      transformRoute: transformRoute
    }) : store;
  });
}
export function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions, renderToStream, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  var history = {
    listen: function listen() {
      return void 0;
    },
    location: createLocation(location)
  };
  var router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, router.historyProxy, storeOptions, renderToStream, function (store) {
    var storeState = store.getState();
    var _storeState$route$dat2 = storeState.route.data,
        paths = _storeState$route$dat2.paths,
        views = _storeState$route$dat2.views;
    console.log({
      paths: paths,
      views: views
    });
    return beforeRender ? beforeRender({
      store: store,
      history: history,
      historyActions: historyActions,
      toBrowserUrl: toBrowserUrl,
      transformRoute: transformRoute
    }) : store;
  });
}
export var Switch = function Switch(_ref3) {
  var children = _ref3.children,
      elseView = _ref3.elseView;

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

export var Link = React.forwardRef(function (_ref4, ref) {
  var _onClick = _ref4.onClick,
      replace = _ref4.replace,
      rest = _objectWithoutPropertiesLoose(_ref4, ["onClick", "replace"]);

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