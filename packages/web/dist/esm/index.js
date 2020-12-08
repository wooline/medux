import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export var WebNativeHistory = function () {
  function WebNativeHistory(createHistory) {
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

  _proto.getLocation = function getLocation() {
    var _this$history$locatio = this.history.location,
        _this$history$locatio2 = _this$history$locatio.pathname,
        pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
        _this$history$locatio3 = _this$history$locatio.search,
        search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
        _this$history$locatio4 = _this$history$locatio.hash,
        hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
    return {
      pathname: pathname,
      search: decodeURIComponent(search).replace('?', ''),
      hash: decodeURIComponent(hash).replace('#', '')
    };
  };

  _proto.getUrl = function getUrl() {
    var _this$history$locatio5 = this.history.location,
        _this$history$locatio6 = _this$history$locatio5.pathname,
        pathname = _this$history$locatio6 === void 0 ? '' : _this$history$locatio6,
        _this$history$locatio7 = _this$history$locatio5.search,
        search = _this$history$locatio7 === void 0 ? '' : _this$history$locatio7,
        _this$history$locatio8 = _this$history$locatio5.hash,
        hash = _this$history$locatio8 === void 0 ? '' : _this$history$locatio8;
    return [pathname, search, hash].join('');
  };

  _proto.parseUrl = function parseUrl(url) {
    if (!url) {
      return {
        pathname: '/',
        search: '',
        hash: ''
      };
    }

    var arr = url.split(/[?#]/);

    if (arr.length === 2 && url.indexOf('?') < 0) {
      arr.splice(1, 0, '');
    }

    var pathname = arr[0],
        _arr$ = arr[1],
        search = _arr$ === void 0 ? '' : _arr$,
        _arr$2 = arr[2],
        hash = _arr$2 === void 0 ? '' : _arr$2;
    return {
      pathname: pathname,
      search: search,
      hash: hash
    };
  };

  _proto.toUrl = function toUrl(location) {
    return [location.pathname, location.search && "?" + location.search, location.hash && "#" + location.hash].join('');
  };

  _proto.block = function block(blocker) {
    var _this = this;

    return this.history.block(function (location, action) {
      var _location$pathname = location.pathname,
          pathname = _location$pathname === void 0 ? '' : _location$pathname,
          _location$search = location.search,
          search = _location$search === void 0 ? '' : _location$search,
          _location$hash = location.hash,
          hash = _location$hash === void 0 ? '' : _location$hash;
      return blocker([pathname, search, hash].join(''), _this.getKey(location), action);
    });
  };

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.push = function push(location, key) {
    this.history.push(this.toUrl(location), key);
  };

  _proto.replace = function replace(location, key) {
    this.history.replace(this.toUrl(location), key);
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.push(this.toUrl(location), key);
  };

  _proto.pop = function pop(location, n, key) {
    if (n < 500) {
      this.history.go(-n);
    } else {
      this.history.push(this.toUrl(location), key);
    }
  };

  return WebNativeHistory;
}();
export var HistoryActions = function (_BaseHistoryActions) {
  _inheritsLoose(HistoryActions, _BaseHistoryActions);

  function HistoryActions(nativeHistory, locationTransform) {
    var _this2;

    _this2 = _BaseHistoryActions.call(this, nativeHistory, locationTransform) || this;
    _this2.nativeHistory = nativeHistory;

    _defineProperty(_assertThisInitialized(_this2), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this2), "_timer", 0);

    _this2._unlistenHistory = _this2.nativeHistory.block(function (url, key, action) {
      if (key !== _this2.getCurKey()) {
        var callback;
        var index = 0;

        if (action === 'POP') {
          index = _this2.findHistoryByKey(key);
        }

        if (index > 0) {
          callback = function callback() {
            _this2._timer = 0;

            _this2.pop(index);
          };
        } else if (action === 'REPLACE') {
          callback = function callback() {
            _this2._timer = 0;

            _this2.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = function callback() {
            _this2._timer = 0;

            _this2.push(url);
          };
        } else {
          callback = function callback() {
            _this2._timer = 0;

            _this2.relaunch(url);
          };
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

  _proto2.refresh = function refresh() {
    this.nativeHistory.history.go(0);
  };

  return HistoryActions;
}(BaseHistoryActions);
export function createRouter(createHistory, locationTransform) {
  var nativeHistory = new WebNativeHistory(createHistory);
  var historyActions = new HistoryActions(nativeHistory, locationTransform);
  return historyActions;
}