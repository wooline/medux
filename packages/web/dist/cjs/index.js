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
  function WebNativeHistory(createHistory) {
    (0, _defineProperty2.default)(this, "history", void 0);

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
      search: search.replace('?', ''),
      hash: hash.replace('#', '')
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
    return [location.pathname, location.search && "?" + encodeURIComponent(location.search), location.hash && "#" + encodeURIComponent(location.hash)].join('');
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

exports.WebNativeHistory = WebNativeHistory;

var HistoryActions = function (_BaseHistoryActions) {
  (0, _inheritsLoose2.default)(HistoryActions, _BaseHistoryActions);

  function HistoryActions(nativeHistory, locationTransform) {
    var _this2;

    _this2 = _BaseHistoryActions.call(this, nativeHistory, locationTransform) || this;
    _this2.nativeHistory = nativeHistory;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_unlistenHistory", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_timer", 0);
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
          _this2._timer = _core.env.setTimeout(callback, 50);
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
}(_routePlanA.BaseHistoryActions);

exports.HistoryActions = HistoryActions;

function createRouter(createHistory, locationTransform) {
  var nativeHistory = new WebNativeHistory(createHistory);
  var historyActions = new HistoryActions(nativeHistory, locationTransform);
  return historyActions;
}