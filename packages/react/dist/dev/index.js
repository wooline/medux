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
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export var loadView = function loadView(moduleGetter, moduleName, viewName, Loading) {
  var _temp;

  return _temp =
  /*#__PURE__*/
  function (_React$Component) {
    _inheritsLoose(Loader, _React$Component);

    function Loader() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

      _defineProperty(_assertThisInitialized(_this), "state", {
        Component: null
      });

      return _this;
    }

    var _proto = Loader.prototype;

    _proto.componentDidMount = function componentDidMount() {
      var _this2 = this;

      var moduleViewResult = getView(moduleGetter, moduleName, viewName);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          Object.keys(Loader).forEach(function (key) {
            return Component[key] = Loader[key];
          });
          Object.keys(Component).forEach(function (key) {
            return Loader[key] = Component[key];
          });

          _this2.setState({
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
        this.setState({
          Component: moduleViewResult
        });
      }
    };

    _proto.render = function render() {
      var Component = this.state.Component;
      return Component ? React.createElement(Component, this.props) : Loading ? React.createElement(Loading, this.props) : null;
    };

    return Loader;
  }(React.Component), _temp;
};
export var exportModule = baseExportModule;
//# sourceMappingURL=index.js.map