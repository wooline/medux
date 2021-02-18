"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.Router = exports.MPNativeRouter = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routeWeb = require("@medux/route-web");

var _core = require("@medux/core");

var MPNativeRouter = function () {
  function MPNativeRouter() {}

  var _proto = MPNativeRouter.prototype;

  _proto.getLocation = function getLocation() {
    return _core.env.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.onChange = function onChange(callback) {
    _core.env.onRouteChange(function (pathname, query, action) {
      callback(pathname, query, query['__key__'], action);
    });
  };

  _proto.push = function push(getUrl, key, internal) {
    !internal && _core.env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.replace = function replace(getUrl, key, internal) {
    !internal && _core.env.redirectTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.relaunch = function relaunch(getUrl, key, internal) {
    !internal && _core.env.reLaunch({
      url: this.toUrl(getUrl(), key)
    });
  };

  _proto.back = function back(getUrl, n, key, internal) {
    !internal && _core.env.navigateBack({
      delta: n
    });
  };

  _proto.pop = function pop(getUrl, n, key, internal) {
    !internal && _core.env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  };

  return MPNativeRouter;
}();

exports.MPNativeRouter = MPNativeRouter;

var Router = function (_BaseRouter) {
  (0, _inheritsLoose2.default)(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    var _this;

    _this = _BaseRouter.call(this, mpNativeRouter.getLocation(), mpNativeRouter, locationTransform) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "nativeRouter", void 0);
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
}(_routeWeb.BaseRouter);

exports.Router = Router;

function createRouter(locationTransform) {
  var mpNativeRouter = new MPNativeRouter();
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}