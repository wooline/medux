import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return baseRenderApp((store, appModel, appViews, ssrInitStoreKey) => {
    const ReduxProvider = props => {
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

  return baseRenderSSR((store, appModel, appViews, ssrInitStoreKey) => {
    const data = store.getState();

    const ReduxProvider = props => {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    return {
      ssrInitStoreKey,
      data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export const loadView = (moduleGetter, moduleName, viewName, Loading) => {
  var _temp;

  return _temp = class Loader extends React.Component {
    constructor() {
      super(...arguments);

      _defineProperty(this, "state", {
        Component: null
      });
    }

    componentDidMount() {
      const moduleViewResult = getView(moduleGetter, moduleName, viewName);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(Component => {
          Object.keys(Loader).forEach(key => Component[key] = Loader[key]);
          Object.keys(Component).forEach(key => Loader[key] = Component[key]);
          this.setState({
            Component
          });
        });
      } else {
        Object.keys(Loader).forEach(key => moduleViewResult[key] = Loader[key]);
        Object.keys(moduleViewResult).forEach(key => Loader[key] = moduleViewResult[key]);
        this.setState({
          Component: moduleViewResult
        });
      }
    }

    render() {
      const {
        Component
      } = this.state;
      return Component ? React.createElement(Component, this.props) : Loading ? React.createElement(Loading, this.props) : null;
    }

  }, _temp;
};
export const exportModule = baseExportModule;
//# sourceMappingURL=index.js.map