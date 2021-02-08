import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter } from '@medux/route-web';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export var BrowserNativeRouter = function () {
  function BrowserNativeRouter(createHistory) {
    _defineProperty(this, "history", void 0);

    _defineProperty(this, "serverSide", false);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      this.serverSide = true;

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

  var _proto = BrowserNativeRouter.prototype;

  _proto.getUrl = function getUrl() {
    var _this$history$locatio = this.history.location,
        _this$history$locatio2 = _this$history$locatio.pathname,
        pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
        _this$history$locatio3 = _this$history$locatio.search,
        search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
        _this$history$locatio4 = _this$history$locatio.hash,
        hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
    return [pathname, search, hash].join('');
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

  _proto.push = function push(getUrl, key, internal) {
    !internal && !this.serverSide && this.history.push(getUrl(), key);
  };

  _proto.replace = function replace(getUrl, key, internal) {
    !internal && !this.serverSide && this.history.replace(getUrl(), key);
  };

  _proto.relaunch = function relaunch(getUrl, key, internal) {
    !internal && !this.serverSide && this.history.push(getUrl(), key);
  };

  _proto.back = function back(getUrl, n, key, internal) {
    !internal && !this.serverSide && this.history.go(-n);
  };

  _proto.pop = function pop(getUrl, n, key, internal) {
    !internal && !this.serverSide && this.history.push(getUrl(), key);
  };

  _proto.refresh = function refresh() {
    this.history.go(0);
  };

  return BrowserNativeRouter;
}();
export var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(browserNativeRouter, locationTransform) {
    var _this2;

    _this2 = _BaseRouter.call(this, browserNativeRouter.getUrl(), browserNativeRouter, locationTransform) || this;

    _defineProperty(_assertThisInitialized(_this2), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this2), "_timer", 0);

    _defineProperty(_assertThisInitialized(_this2), "nativeRouter", void 0);

    _this2.nativeRouter = browserNativeRouter;
    _this2._unlistenHistory = browserNativeRouter.block(function (url, key, action) {
      if (key !== _this2.getCurKey()) {
        var callback;
        var index = 0;

        if (action === 'POP') {
          index = _this2.history.getActionIndex(key);
        }

        if (index > 0) {
          callback = function callback() {
            _this2._timer = 0;

            _this2.back(index);
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

  var _proto2 = Router.prototype;

  _proto2.destroy = function destroy() {
    this._unlistenHistory();
  };

  return Router;
}(BaseRouter);
export function createRouter(createHistory, locationTransform) {
  var browserNativeRouter = new BrowserNativeRouter(createHistory);
  var router = new Router(browserNativeRouter, locationTransform);
  return router;
}