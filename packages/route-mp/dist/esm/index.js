import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter } from '@medux/route-web';
export var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(env) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _this.env = env;
    _this._unlistenHistory = env.onRouteChange(function (pathname, searchData, action) {
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
    return this.env.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.push = function push(getNativeData, key, internal) {
    if (!internal) {
      var nativeData = getNativeData();
      return this.env.navigateTo({
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
      return this.env.redirectTo({
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
      return this.env.reLaunch({
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
      return this.env.navigateBack({
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
      return this.env.reLaunch({
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
}(BaseNativeRouter);
export var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    return _BaseRouter.call(this, mpNativeRouter.getLocation(), mpNativeRouter, locationTransform) || this;
  }

  return Router;
}(BaseRouter);
export function createRouter(locationTransform, env) {
  var mpNativeRouter = new MPNativeRouter(env);
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}