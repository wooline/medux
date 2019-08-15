import {HistoryProxy, ModuleGetter, RouteData, StoreOptions} from '@medux/core/types/export';
import {NavigationContainer, NavigationContainerComponent} from 'react-navigation';

import {AppRegistry} from 'react-native';
import React from 'react';
import {renderApp} from '@medux/react';

export {loadView, exportModule} from '@medux/react';

export const toBrowserUrl = buildToBrowserUrl(() => transformRoute!);

interface Location {
  data: any;
  etag: number;
}

class RnHistoryProxy implements HistoryProxy<Location> {
  public initialized = false;
  public navigator: NavigationContainerComponent | undefined;
  protected location: Location | undefined;
  protected listeners: ((location: Location) => void)[] = [];

  public subscribe(listener: (location: Location) => void) {
    this.listeners.push(listener);
  }
  public dispatchChanges() {
    const location = this.getLocation();
    this.listeners.forEach(handler => {
      handler(location);
    });
  }
  public getLocation() {
    return this.location!;
  }
  public locationToRouteData(location: Location) {
    return location.state || this.locationToRoute(location);
  }
  public equal(a: Location, b: Location) {
    return a === b;
  }
  public patch(location: Location, routeData: RouteData): void {
    this.history.push({...location, state: routeData});
  }
}
const historyProxy = new RnHistoryProxy();
function initNavigator(navigator: NavigationContainerComponent) {
  historyProxy.initialized = true;
  historyProxy.navigator = navigator;
  historyProxy.dispatchChanges();
  console.log(navigator.state);
}
export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(appName: string, moduleGetter: M, appModuleName: A, storeOptions: StoreOptions = {}) {
  return renderApp(
    (Provider, AppMainView: NavigationContainer) => {
      const App = () => (
        <Provider>
          <AppMainView ref={initNavigator} onNavigationStateChange={(prevState, currentState, action) => {}} />
        </Provider>
      );
      AppRegistry.registerComponent(appName, () => App);
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}
