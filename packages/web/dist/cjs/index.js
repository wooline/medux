"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routePlanA = require("@medux/route-plan-a");

var BrowserHistoryActions = function () {
  function BrowserHistoryActions(_history, _transformRoute, _locationMap) {
    var _this = this;

    this._history = _history;
    this._transformRoute = _transformRoute;
    this._locationMap = _locationMap;
    (0, _defineProperty2.default)(this, "initialized", true);
    (0, _defineProperty2.default)(this, "_dispatcher", void 0);
    (0, _defineProperty2.default)(this, "_location", void 0);
    (0, _defineProperty2.default)(this, "_unlistenHistory", void 0);
    this._dispatcher = new _routePlanA.Dispatcher();
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

function createRouter(history, routeConfig, locationMap) {
  var transformRoute = (0, _routePlanA.buildTransformRoute)(routeConfig, function () {
    return historyActions.getLocation().pathname;
  });
  var historyActions = new BrowserHistoryActions(history, transformRoute, locationMap);
  return {
    transformRoute: transformRoute,
    historyActions: historyActions
  };
}