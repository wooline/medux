import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';

function locationToUrl(loaction) {
  return loaction.pathname + loaction.search + loaction.hash;
}

export var WebNativeHistory = function () {
  function WebNativeHistory(createHistory, locationMap) {
    this.locationMap = locationMap;

    _defineProperty(this, "history", void 0);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
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
          pathname: pathname,
          search: search && "?" + search,
          hash: ''
        }
      };
    }
  }

  var _proto = WebNativeHistory.prototype;

  _proto.block = function block(blocker) {
    var _this = this;

    return this.history.block(function (location, action) {
      return blocker({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      }, _this.getKey(location), action);
    });
  };

  _proto.getUrl = function getUrl() {
    var location = this.locationMap ? this.locationMap.in(this.history.location) : this.history.location;
    return locationToUrl(location);
  };

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.push = function push(location) {
    this.history.push(locationToUrl(location), location.key);
  };

  _proto.replace = function replace(location) {
    this.history.replace(locationToUrl(location), location.key);
  };

  _proto.relaunch = function relaunch(location) {
    this.history.push(locationToUrl(location), location.key);
  };

  _proto.pop = function pop(location, n) {
    this.history.go(-n);
  };

  return WebNativeHistory;
}();
export var HistoryActions = function (_BaseHistoryActions) {
  _inheritsLoose(HistoryActions, _BaseHistoryActions);

  function HistoryActions(nativeHistory, defaultRouteParams, routeRule, locationMap) {
    var _this2;

    _this2 = _BaseHistoryActions.call(this, nativeHistory, defaultRouteParams, nativeHistory.getUrl(), routeRule, locationMap) || this;
    _this2.nativeHistory = nativeHistory;
    _this2.defaultRouteParams = defaultRouteParams;
    _this2.routeRule = routeRule;
    _this2.locationMap = locationMap;

    _defineProperty(_assertThisInitialized(_this2), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this2), "_timer", 0);

    _this2._unlistenHistory = _this2.nativeHistory.block(function (location, key, action) {
      if (key !== _this2.getCurKey()) {
        var callback;
        var index = 0;

        if (action === 'POP') {
          index = _this2.findHistoryByKey(key).index;
        }

        if (index > 0) {
          callback = function callback() {
            _this2._timer = 0;

            _this2.pop(index);
          };
        } else {
          var paLocation = _this2.locationMap ? _this2.locationMap.in(location) : location;

          if (action === 'REPLACE') {
            callback = function callback() {
              _this2._timer = 0;

              _this2.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = function callback() {
              _this2._timer = 0;

              _this2.push(paLocation);
            };
          } else {
            callback = function callback() {
              _this2._timer = 0;

              _this2.relaunch(paLocation);
            };
          }
        }

        if (callback && !_this2._timer) {
          _this2._timer = env.setTimeout(callback, 50);
        }

        return false;
      }

      return undefined;
    });
    return _this2;
  }

  var _proto2 = HistoryActions.prototype;

  _proto2.getNativeHistory = function getNativeHistory() {
    return this.nativeHistory.history;
  };

  _proto2.destroy = function destroy() {
    this._unlistenHistory();
  };

  return HistoryActions;
}(BaseHistoryActions);
export function createRouter(createHistory, defaultRouteParams, routeRule, locationMap) {
  var nativeHistory = new WebNativeHistory(createHistory);
  var historyActions = new HistoryActions(nativeHistory, defaultRouteParams, routeRule, locationMap);
  return historyActions;
}