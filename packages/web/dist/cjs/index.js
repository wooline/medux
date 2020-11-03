"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.HistoryActions = exports.WebNativeHistory = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routePlanA = require("@medux/route-plan-a");

var _history = require("history");

var _core = require("@medux/core");

var WebNativeHistory = function () {
  function WebNativeHistory(createHistory, locationMap) {
    this.locationMap = locationMap;
    (0, _defineProperty2.default)(this, "history", void 0);
    (0, _defineProperty2.default)(this, "initLocation", void 0);
    (0, _defineProperty2.default)(this, "actions", void 0);

    if (createHistory === 'Hash') {
      this.history = (0, _history.createHashHistory)();
    } else if (createHistory === 'Memory') {
      this.history = (0, _history.createMemoryHistory)();
    } else if (createHistory === 'Browser') {
      this.history = (0, _history.createBrowserHistory)();
    } else {
      var _createHistory$split = createHistory.split('?'),
          pathname = _createHistory$split[0],
          _createHistory$split$ = _createHistory$split[1],
          search = _createHistory$split$ === void 0 ? '' : _createHistory$split$;

      this.history = {
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

    this.initLocation = this.locationMap ? this.locationMap.in(this.history.location) : this.history.location;
  }

  var _proto = WebNativeHistory.prototype;

  _proto.block = function block(blocker) {
    var _this = this;

    return this.history.block(function (location, action) {
      return blocker(location, _this.getKey(location), action);
    });
  };

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.push = function push(location) {
    this.history.push((0, _routePlanA.locationToUrl)(location), location.key);
  };

  _proto.replace = function replace(location) {
    this.history.replace((0, _routePlanA.locationToUrl)(location), location.key);
  };

  _proto.relaunch = function relaunch(location) {
    this.history.push((0, _routePlanA.locationToUrl)(location), location.key);
  };

  _proto.pop = function pop(location, n) {
    this.history.go(-n);
  };

  return WebNativeHistory;
}();

exports.WebNativeHistory = WebNativeHistory;

var HistoryActions = function (_BaseHistoryActions) {
  (0, _inheritsLoose2.default)(HistoryActions, _BaseHistoryActions);

  function HistoryActions(nativeHistory, homeUrl, routeConfig, maxLength, locationMap) {
    var _this2;

    _this2 = _BaseHistoryActions.call(this, nativeHistory, homeUrl, routeConfig, maxLength, locationMap) || this;
    _this2.nativeHistory = nativeHistory;
    _this2.homeUrl = homeUrl;
    _this2.routeConfig = routeConfig;
    _this2.maxLength = maxLength;
    _this2.locationMap = locationMap;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_unlistenHistory", void 0);
    _this2._unlistenHistory = _this2.nativeHistory.block(function (location, key, action) {
      if (key !== _this2.getCurKey()) {
        var callback;
        var index = 0;

        if (action === 'POP') {
          index = _this2.findHistoryByKey(key).index;
        }

        if (index > 0) {
          callback = function callback() {
            _this2.pop(index);
          };
        } else {
          var paLocation = _this2.locationMap ? _this2.locationMap.in(location) : location;

          if (action === 'REPLACE') {
            callback = function callback() {
              _this2.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = function callback() {
              _this2.push(paLocation);
            };
          } else {
            callback = function callback() {
              _this2.relaunch(paLocation);
            };
          }
        }

        callback && _core.env.setTimeout(callback, 0);
        return false;
      }

      return undefined;
    });
    return _this2;
  }

  var _proto2 = HistoryActions.prototype;

  _proto2.destroy = function destroy() {
    this._unlistenHistory();
  };

  return HistoryActions;
}(_routePlanA.BaseHistoryActions);

exports.HistoryActions = HistoryActions;

function createRouter(createHistory, homeUrl, routeConfig, locationMap) {
  var nativeHistory = new WebNativeHistory(createHistory);
  var historyActions = new HistoryActions(nativeHistory, homeUrl, routeConfig, 10, locationMap);
  nativeHistory.actions = historyActions;
  historyActions.relaunch(nativeHistory.initLocation);
  return historyActions;
}