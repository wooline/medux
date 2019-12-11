import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return baseRenderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export function renderSSR(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return baseRenderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export var loadView = function loadView(moduleName, viewName, options) {
  var _temp;

  if (options === void 0) {
    options = {};
  }

  return _temp =
  /*#__PURE__*/
  function (_React$Component) {
    _inheritsLoose(Loader, _React$Component);

    function Loader(props, context) {
      var _this;

      _this = _React$Component.call(this, props, context) || this;

      _defineProperty(_assertThisInitialized(_this), "state", {
        Component: null
      });

      var moduleViewResult = getView(moduleName, viewName, options.modelOptions);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          Object.keys(Loader).forEach(function (key) {
            return Component[key] = Loader[key];
          });
          Object.keys(Component).forEach(function (key) {
            return Loader[key] = Component[key];
          });

          _this.setState({
            Component: Component
          });
        });
      } else {
        Object.keys(Loader).forEach(function (key) {
          return moduleViewResult[key] = Loader[key];
        });
        Object.keys(moduleViewResult).forEach(function (key) {
          return Loader[key] = moduleViewResult[key];
        });
        _this.state = {
          Component: moduleViewResult
        };
      }

      return _this;
    }

    var _proto = Loader.prototype;

    _proto.render = function render() {
      var Component = this.state.Component;
      return Component ? React.createElement(Component, this.props) : options.Loading ? React.createElement(options.Loading, this.props) : null;
    };

    return Loader;
  }(React.Component), _temp;
};
export var exportModule = baseExportModule;
//# sourceMappingURL=index.js.map