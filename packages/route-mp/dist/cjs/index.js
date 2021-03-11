"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.Router = exports.MPNativeRouter = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routeWeb = require("@medux/route-web");

var MPNativeRouter = function (_BaseNativeRouter) {
  (0, _inheritsLoose2.default)(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(routeENV, tabPages) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    _this.routeENV = routeENV;
    _this.tabPages = tabPages;
    _this._unlistenHistory = routeENV.onRouteChange(function (pathname, searchData, action) {
      var key = searchData ? searchData['__key__'] : '';
      var nativeLocation = {
        pathname: pathname,
        searchData: searchData
      };

      var changed = _this.onChange(key);

      if (changed) {
        var index = 0;

        if (action === 'POP') {
          index = _this.router.searchKeyInActions(key);
        }

        if (index > 0) {
          _this.router.back(index, '', false, true);
        } else if (action === 'REPLACE') {
          _this.router.replace(nativeLocation, false, true);
        } else if (action === 'PUSH') {
          _this.router.push(nativeLocation, false, true);
        } else {
          _this.router.relaunch(nativeLocation, false, true);
        }
      }
    });
    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.getLocation = function getLocation() {
    return this.routeENV.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.push = function push(getNativeData, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();

      if (this.tabPages[nativeData.nativeUrl]) {
        throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
      }

      return this.routeENV.navigateTo({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(function () {
        return nativeData;
      });
    }

    return undefined;
  };

  _proto.replace = function replace(getNativeData, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();

      if (this.tabPages[nativeData.nativeUrl]) {
        throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
      }

      return this.routeENV.redirectTo({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(function () {
        return nativeData;
      });
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(getNativeData, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();

      if (this.tabPages[nativeData.nativeUrl]) {
        return this.routeENV.switchTab({
          url: nativeData.nativeUrl
        }).then(function () {
          return nativeData;
        });
      }

      return this.routeENV.reLaunch({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(function () {
        return nativeData;
      });
    }

    return undefined;
  };

  _proto.back = function back(getNativeData, n, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();
      return this.routeENV.navigateBack({
        delta: n
      }).then(function () {
        return nativeData;
      });
    }

    return undefined;
  };

  _proto.pop = function pop(getNativeData, n, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();
      return this.routeENV.reLaunch({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(function () {
        return nativeData;
      });
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return MPNativeRouter;
}(_routeWeb.BaseNativeRouter);

exports.MPNativeRouter = MPNativeRouter;

var Router = function (_BaseRouter) {
  (0, _inheritsLoose2.default)(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    return _BaseRouter.call(this, mpNativeRouter.getLocation(), mpNativeRouter, locationTransform) || this;
  }

  return Router;
}(_routeWeb.BaseRouter);

exports.Router = Router;

function createRouter(locationTransform, routeENV, tabPages) {
  var mpNativeRouter = new MPNativeRouter(routeENV, tabPages);
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}