import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { Dispatcher, buildTransformRoute } from '@medux/route-plan-a';

class BrowserHistoryActions {
  constructor(_history, _transformRoute, _locationMap) {
    this._history = _history;
    this._transformRoute = _transformRoute;
    this._locationMap = _locationMap;

    _defineProperty(this, "initialized", true);

    _defineProperty(this, "_dispatcher", void 0);

    _defineProperty(this, "_location", void 0);

    _defineProperty(this, "_unlistenHistory", void 0);

    this._dispatcher = new Dispatcher();
    const location = Object.assign({}, this._history.location, {
      action: this._history.action
    });
    this._location = this._locationMap ? this._locationMap.in(location) : location;
    this._unlistenHistory = this._history.listen((location, action) => {
      location = Object.assign({}, location, {
        action
      });
      this._location = this._locationMap ? this._locationMap.in(location) : location;

      this._dispatcher.dispatch(this._location);
    });
  }

  destroy() {
    this._unlistenHistory();
  }

  getLocation() {
    return this._location;
  }

  getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
  }

  subscribe(listener) {
    return this._dispatcher.subscribe(listener);
  }

  locationToRouteData(location) {
    return this._transformRoute.locationToRoute(location);
  }

  equal(a, b) {
    return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
  }

  patch(location, routeData) {
    this.push(location);
  }

  push(data) {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);

    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  }

  replace(data) {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);

    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  }

  toUrl(data) {
    let location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  }

  go(n) {
    this._history.go(n);
  }

  back() {
    this._history.back();
  }

  forward() {
    this._history.forward();
  }

}

export function createRouter(history, routeConfig, locationMap) {
  const transformRoute = buildTransformRoute(routeConfig, () => {
    return historyActions.getLocation().pathname;
  });
  const historyActions = new BrowserHistoryActions(history, transformRoute, locationMap);
  return {
    transformRoute,
    historyActions
  };
}