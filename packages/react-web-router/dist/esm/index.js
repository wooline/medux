import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { setRouteConfig } from '@medux/route-plan-a';
import { ActionTypes, isServer } from '@medux/core';
import React from 'react';
import { renderApp, renderSSR } from '@medux/react';
import { createRouter } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
var historyActions;
var transformRoute;

var redirectMiddleware = function redirectMiddleware() {
  return function (next) {
    return function (action) {
      if (action.type === ActionTypes.RouteChange) {
        var routeState = action.payload[0];
        var views = routeState.data.views;

        if (views['@']) {
          var url = Object.keys(views['@'])[0];

          if (isServer()) {
            throw {
              code: '301',
              message: url,
              detail: url
            };
          } else {
            historyActions.replace(url);
          }

          return;
        }
      }

      return next(action);
    };
  };
};

export function buildApp(_ref) {
  var moduleGetter = _ref.moduleGetter,
      _ref$appModuleName = _ref.appModuleName,
      appModuleName = _ref$appModuleName === void 0 ? 'app' : _ref$appModuleName,
      _ref$appViewName = _ref.appViewName,
      appViewName = _ref$appViewName === void 0 ? 'main' : _ref$appViewName,
      _ref$historyType = _ref.historyType,
      historyType = _ref$historyType === void 0 ? 'Browser' : _ref$historyType,
      _ref$routeConfig = _ref.routeConfig,
      routeConfig = _ref$routeConfig === void 0 ? {} : _ref$routeConfig,
      locationMap = _ref.locationMap,
      defaultRouteParams = _ref.defaultRouteParams,
      _ref$storeOptions = _ref.storeOptions,
      storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions,
      _ref$container = _ref.container,
      container = _ref$container === void 0 ? 'root' : _ref$container,
      beforeRender = _ref.beforeRender;
  setRouteConfig({
    defaultRouteParams: defaultRouteParams
  });
  var router = createRouter(historyType, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, container, function (store) {
    return beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions,
      transformRoute: transformRoute
    }) : store;
  });
}
export function buildSSR(_ref2) {
  var moduleGetter = _ref2.moduleGetter,
      _ref2$appModuleName = _ref2.appModuleName,
      appModuleName = _ref2$appModuleName === void 0 ? 'app' : _ref2$appModuleName,
      _ref2$appViewName = _ref2.appViewName,
      appViewName = _ref2$appViewName === void 0 ? 'main' : _ref2$appViewName,
      location = _ref2.location,
      _ref2$routeConfig = _ref2.routeConfig,
      routeConfig = _ref2$routeConfig === void 0 ? {} : _ref2$routeConfig,
      locationMap = _ref2.locationMap,
      defaultRouteParams = _ref2.defaultRouteParams,
      _ref2$storeOptions = _ref2.storeOptions,
      storeOptions = _ref2$storeOptions === void 0 ? {} : _ref2$storeOptions,
      _ref2$renderToStream = _ref2.renderToStream,
      renderToStream = _ref2$renderToStream === void 0 ? false : _ref2$renderToStream,
      beforeRender = _ref2.beforeRender;
  setRouteConfig({
    defaultRouteParams: defaultRouteParams
  });
  var router = createRouter(location, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, renderToStream, function (store) {
    return beforeRender ? beforeRender({
      store: store,
      historyActions: historyActions,
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