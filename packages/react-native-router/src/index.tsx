import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core/types/export';

import {AppRegistry} from 'react-native';
import React from 'react';
import {renderApp} from '@medux/react';

export {loadView, exportModule} from '@medux/react';

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(appName: string, moduleGetter: M, appModuleName: A, storeOptions: StoreOptions = {}): Promise<void> {
  return renderApp(
    (Provider, AppMainView) => {
      const App = () => (
        <Provider>
          <AppMainView />
        </Provider>
      );
      AppRegistry.registerComponent(appName, () => App);
    },
    moduleGetter,
    appModuleName,
    storeOptions
  );
}

export type RootState<G extends ModuleGetter> = BaseRootState<G>;
