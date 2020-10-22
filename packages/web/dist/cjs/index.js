"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.Action = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routePlanA = require("@medux/route-plan-a");

var _history2 = require("history");

var Action;
exports.Action = Action;

(function (Action) {
  Action["Push"] = "PUSH";
  Action["Pop"] = "POP";
  Action["Replace"] = "REPLACE";
})(Action || (exports.Action = Action = {}));

var WebHistoryActions = function (_BaseHistoryActions) {
  (0, _inheritsLoose2.default)(WebHistoryActions, _BaseHistoryActions);

  function WebHistoryActions(_history, _transformRoute, _locationMap) {
    var _this;

    _this = _BaseHistoryActions.call(this, _locationMap ? _locationMap.in(Object.assign(Object.assign({}, _history.location), {}, {
      action: _history.action
    })) : Object.assign(Object.assign({}, _history.location), {}, {
      action: _history.action
    }), true, _transformRoute) || this;
    _this._history = _history;
    _this._locationMap = _locationMap;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    _this._unlistenHistory = _this._history.block(function (location, action) {
      var meduxLocation = _locationMap ? _locationMap.in(Object.assign(Object.assign({}, location), {}, {
        action: action
      })) : Object.assign(Object.assign({}, location), {}, {
        action: action
      });

      if (!_this.equal(meduxLocation, _this.getLocation())) {
        return meduxLocation.action + "::" + (0, _routePlanA.safelocationToUrl)(meduxLocation);
      }

      return undefined;
    });
    return _this;
  }

  var _proto = WebHistoryActions.prototype;

  _proto.getHistory = function getHistory() {
    return this._history;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  _proto.toUrl = function toUrl(data) {
    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  };

  _proto.patch = function patch(location, routeData) {
    this.push(location);
  };

  _proto.push = function push(data) {
    var _this2 = this;

    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch(Object.assign(Object.assign({}, location), {}, {
      action: Action.Push
    })).then(function () {
      _this2._history.push(_this2._locationMap ? _this2._locationMap.out(location) : location);
    });
  };

  _proto.replace = function replace(data) {
    var _this3 = this;

    var location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch(Object.assign(Object.assign({}, location), {}, {
      action: Action.Replace
    })).then(function () {
      _this3._history.replace(_this3._locationMap ? _this3._locationMap.out(location) : location);
    });
  };

  _proto.go = function go(n) {
    this._history.go(n);
  };

  _proto.back = function back() {
    this._history.goBack();
  };

  _proto.forward = function forward() {
    this._history.goForward();
  };

  _proto.passive = function passive() {
    throw 1;
  };

  return WebHistoryActions;
}(_routePlanA.BaseHistoryActions);

function createRouter(createHistory, routeConfig, locationMap) {
  var history;
  var historyOptions = {
    getUserConfirmation: function getUserConfirmation(str, callback) {
      var _str$split = str.split('::'),
          action = _str$split[0],
          pathname = _str$split[1];

      var location = (0, _routePlanA.safeurlToLocation)(pathname);
      location.action = action;
      historyActions.dispatch(location).then(function () {
        callback(true);
      }).catch(function (e) {
        callback(false);
        throw e;
      });
    }
  };

  if (createHistory === 'Hash') {
    history = (0, _history2.createHashHistory)(historyOptions);
  } else if (createHistory === 'Memory') {
    history = (0, _history2.createMemoryHistory)(historyOptions);
  } else if (createHistory === 'Browser') {
    history = (0, _history2.createBrowserHistory)(historyOptions);
  } else {
    var _createHistory$split = createHistory.split('?'),
        pathname = _createHistory$split[0],
        _createHistory$split$ = _createHistory$split[1],
        search = _createHistory$split$ === void 0 ? '' : _createHistory$split$;

    history = {
      action: 'PUSH',
      length: 0,
      listen: function listen() {
        return function () {
          return undefined;
        };
      },
      createHref: function createHref() {
        return '';
      },
      push: function push() {},
      replace: function replace() {},
      go: function go() {},
      goBack: function goBack() {},
      goForward: function goForward() {},
      block: function block() {
        return function () {
          return undefined;
        };
      },
      location: {
        state: null,
        pathname: pathname,
        search: search && "?" + search,
        hash: ''
      }
    };
  }

  var getCurPathname = function getCurPathname() {
    return historyActions.getLocation().pathname;
  };

  var _locationMap = locationMap;

  if (locationMap && _locationMap) {
    _locationMap.in = function (location) {
      return (0, _routePlanA.checkLocation)(locationMap.in(location), getCurPathname());
    };

    _locationMap.out = function (location) {
      return (0, _routePlanA.checkLocation)(locationMap.out(location), getCurPathname());
    };
  }

  var transformRoute = (0, _routePlanA.buildTransformRoute)(routeConfig, getCurPathname);
  var historyActions = new WebHistoryActions(history, transformRoute, _locationMap);
  return {
    transformRoute: transformRoute,
    historyActions: historyActions
  };
}