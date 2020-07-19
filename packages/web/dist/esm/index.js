import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { Dispatcher, buildTransformRoute } from '@medux/route-plan-a';

var BrowserHistoryActions = function () {
  function BrowserHistoryActions(_history, _transformRoute, _locationMap) {
    var _this = this;

    this._history = _history;
    this._transformRoute = _transformRoute;
    this._locationMap = _locationMap;

    _defineProperty(this, "initialized", true);

    _defineProperty(this, "_dispatcher", void 0);

    _defineProperty(this, "_location", void 0);

    _defineProperty(this, "_unlistenHistory", void 0);

    this._dispatcher = new Dispatcher();
    var location = Object.assign({}, this._history.location, {
      action: this._history.action
    });
    this._location = this._locationMap ? this._locationMap.in(location) : location;
    this._unlistenHistory = this._history.listen(function (location, action) {
      location = Object.assign({}, location, {
        action: action
      });
      _this._location = _this._locationMap ? _this._locationMap.in(location) : location;

      _this._dispatcher.dispatch(_this._location);
    });
  }

  var _proto = BrowserHistoryActions.prototype;

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  _proto.getLocation = function getLocation() {
    return this._location;
  };

  _proto.getRouteData = function getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
  };

  _proto.subscribe = function subscribe(listener) {
    return this._dispatcher.subscribe(listener);
  };

  _proto.locationToRouteData = function locationToRouteData(location) {
    return this._transformRoute.locationToRoute(location);
  };

  _proto.equal = function equal(a, b) {
    return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
  };

  _proto.patch = function patch(location, routeData) {
    this.push(location);
  };

  _proto.push = function push(data) {
    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);

    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  };

  _proto.replace = function replace(data) {
    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);

    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  };

  _proto.toUrl = function toUrl(data) {
    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  };

  _proto.go = function go(n) {
    this._history.go(n);
  };

  _proto.back = function back() {
    this._history.back();
  };

  _proto.forward = function forward() {
    this._history.forward();
  };

  return BrowserHistoryActions;
}();

export function createRouter(history, routeConfig, locationMap) {
  var transformRoute = buildTransformRoute(routeConfig, function () {
    return historyActions.getLocation().pathname;
  });
  var historyActions = new BrowserHistoryActions(history, transformRoute, locationMap);
  return {
    transformRoute: transformRoute,
    historyActions: historyActions
  };
}