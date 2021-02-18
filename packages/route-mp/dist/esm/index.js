import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter } from '@medux/route-web';
import { env } from '@medux/core';
export var MPNativeRouter = function () {
  function MPNativeRouter() {}

  var _proto = MPNativeRouter.prototype;

  _proto.getLocation = function getLocation() {
    return env.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.onChange = function onChange(callback) {
    env.onRouteChange(function (pathname, query, action) {
      callback(pathname, query, query['__key__'], action);
    });
  };

  _proto.push = function push(getUrl, key, internal) {
    !internal && env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.replace = function replace(getUrl, key, internal) {
    !internal && env.redirectTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.relaunch = function relaunch(getUrl, key, internal) {
    !internal && env.reLaunch({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.back = function back(getUrl, n, key, internal) {
    !internal && env.navigateBack({
      delta: n
    });
  };

  _proto.pop = function pop(getUrl, n, key, internal) {
    !internal && env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  return MPNativeRouter;
}();
export var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    var _this;

    _this = _BaseRouter.call(this, mpNativeRouter.getLocation(), mpNativeRouter, locationTransform) || this;

    _defineProperty(_assertThisInitialized(_this), "nativeRouter", void 0);

    _this.nativeRouter = mpNativeRouter;
    mpNativeRouter.onChange(function (url, query, key, action) {
      if (key !== _this.getCurKey()) {
        if (action === 'POP') {
          var index = _this.history.getActionIndex(key);

          if (index > 0) {
            _this.back(index);
          }
        } else if (action === 'REPLACE') {
          _this.replace(url);
        } else if (action === 'PUSH') {
          _this.push(url);
        } else {
          _this.relaunch(url);
        }
      }
    });
    return _this;
  }

  var _proto2 = Router.prototype;

  _proto2.destroy = function destroy() {};

  return Router;
}(BaseRouter);
export function createRouter(locationTransform) {
  var mpNativeRouter = new MPNativeRouter();
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}