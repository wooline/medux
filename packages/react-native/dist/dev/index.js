import { AppRegistry } from 'react-native';
import React from 'react';
import { renderApp } from '@medux/react';
export { loadView, exportModule } from '@medux/react';
export function buildApp(appName, moduleGetter, appModuleName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return renderApp(function (Provider, AppMainView) {
    var App = function App() {
      return React.createElement(Provider, null, React.createElement(AppMainView, null));
    };

    AppRegistry.registerComponent(appName, function () {
      return App;
    });
  }, moduleGetter, appModuleName, storeOptions);
}
//# sourceMappingURL=index.js.map