"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.BaseRouter = exports.BaseNativeRouter = exports.ModuleWithRouteHandlers = exports.RouteActionTypes = exports.createRouteModule = exports.routeMiddleware = exports.createLocationTransform = exports.PagenameMap = exports.nativeUrlToNativeLocation = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@medux/core");

var _basic = require("./basic");

exports.routeConfig = _basic.routeConfig;
exports.setRouteConfig = _basic.setRouteConfig;
exports.nativeUrlToNativeLocation = _basic.nativeUrlToNativeLocation;

var _module = require("./module");

exports.routeMiddleware = _module.routeMiddleware;
exports.createRouteModule = _module.createRouteModule;
exports.RouteActionTypes = _module.RouteActionTypes;
exports.ModuleWithRouteHandlers = _module.ModuleWithRouteHandlers;

var _transform = require("./transform");

exports.PagenameMap = _transform.PagenameMap;
exports.createLocationTransform = _transform.createLocationTransform;

function dataIsNativeLocation(data) {
  return data['pathname'];
}

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "router", null);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  };

  _proto.setRouter = function setRouter(router) {
    this.router = router;
  };

  _proto.execute = function execute(method, getNativeData) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      var task = {
        resolve: resolve,
        reject: reject,
        nativeData: undefined
      };
      _this.curTask = task;

      var result = _this[method].apply(_this, [function () {
        var nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }].concat(args));

      if (!result) {
        resolve(undefined);
        _this.curTask = undefined;
      } else if ((0, _core.isPromise)(result)) {
        result.catch(function (e) {
          reject(e);
          _this.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();

exports.BaseNativeRouter = BaseNativeRouter;

var BaseRouter = function () {
  function BaseRouter(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "_nativeData", void 0);
    (0, _defineProperty2.default)(this, "routeState", void 0);
    (0, _defineProperty2.default)(this, "meduxUrl", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "history", void 0);
    (0, _defineProperty2.default)(this, "_lid", 0);
    (0, _defineProperty2.default)(this, "listenerMap", {});
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    var location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    var key = this._createKey();

    var routeState = (0, _extends2.default)({}, location, {
      action: 'RELAUNCH',
      key: key
    });
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (!_basic.routeConfig.indexUrl) {
      (0, _basic.setRouteConfig)({
        indexUrl: this.meduxUrl
      });
    }

    this._nativeData = undefined;
    this.history = new _basic.History({
      location: location,
      key: key
    });
  }

  var _proto2 = BaseRouter.prototype;

  _proto2.addListener = function addListener(callback) {
    this._lid++;
    var id = "" + this._lid;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto2.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var arr = Object.keys(listenerMap).map(function (id) {
      return listenerMap[id](data);
    });
    return Promise.all(arr);
  };

  _proto2.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto2.getPagename = function getPagename() {
    return this.routeState.pagename;
  };

  _proto2.getParams = function getParams() {
    return this.routeState.params;
  };

  _proto2.getMeduxUrl = function getMeduxUrl() {
    return this.meduxUrl;
  };

  _proto2.getNativeLocation = function getNativeLocation() {
    if (!this._nativeData) {
      var nativeLocation = this.locationTransform.out(this.routeState);
      var nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation: nativeLocation,
        nativeUrl: nativeUrl
      };
    }

    return this._nativeData.nativeLocation;
  };

  _proto2.getNativeUrl = function getNativeUrl() {
    if (!this._nativeData) {
      var nativeLocation = this.locationTransform.out(this.routeState);
      var nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation: nativeLocation,
        nativeUrl: nativeUrl
      };
    }

    return this._nativeData.nativeUrl;
  };

  _proto2.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto2.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto2.findHistoryIndex = function findHistoryIndex(key) {
    return this.history.findIndex(key);
  };

  _proto2._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto2.nativeUrlToNativeLocation = function nativeUrlToNativeLocation(url) {
    return (0, _basic.nativeUrlToNativeLocation)(url);
  };

  _proto2.nativeLocationToLocation = function nativeLocationToLocation(nativeLocation) {
    var location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      _core.env.console.warn(error);

      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  };

  _proto2.nativeUrlToLocation = function nativeUrlToLocation(nativeUrl) {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
  };

  _proto2.urlToLocation = function urlToLocation(url) {
    var _url$split = url.split('?'),
        pathname = _url$split[0],
        others = _url$split.slice(1);

    var query = others.join('?');
    var location;

    try {
      if (query.startsWith('{')) {
        var _data = JSON.parse(query);

        location = this.locationTransform.in({
          pagename: pathname,
          params: _data
        });
      } else {
        var nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      _core.env.console.warn(error);

      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  };

  _proto2.nativeLocationToNativeUrl = function nativeLocationToNativeUrl(nativeLocation) {
    return (0, _basic.nativeLocationToNativeUrl)(nativeLocation);
  };

  _proto2.locationToNativeUrl = function locationToNativeUrl(location) {
    var nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  };

  _proto2.locationToMeduxUrl = function locationToMeduxUrl(location) {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  };

  _proto2.payloadToPartial = function payloadToPartial(payload) {
    var params = payload.params;
    var extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = (0, _core.deepMerge)({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pagename: payload.pagename || this.routeState.pagename,
      params: params || {}
    };
  };

  _proto2.relaunch = function relaunch(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, internal, disableNative) {
      var _this2 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(typeof data === 'string')) {
                _context.next = 7;
                break;
              }

              if (!/^[\w:]*\/\//.test(data)) {
                _context.next = 4;
                break;
              }

              this.nativeRouter.toOutside(data);
              return _context.abrupt("return");

            case 4:
              location = this.urlToLocation(data);
              _context.next = 8;
              break;

            case 7:
              if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

            case 8:
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 12;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 12:
              _context.next = 14;
              return this.dispatch(routeState);

            case 14:
              if (!(!disableNative && !internal)) {
                _context.next = 18;
                break;
              }

              _context.next = 17;
              return this.nativeRouter.execute('relaunch', function () {
                var nativeLocation = _this2.locationTransform.out(routeState);

                var nativeUrl = _this2.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key);

            case 17:
              nativeData = _context.sent;

            case 18:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);
              this.store.dispatch((0, _module.routeChangeAction)(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(location, key);
              } else {
                this.history.relaunch(location, key);
              }

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _relaunch(_x, _x2, _x3) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.push = function push(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._push.bind(this, data, internal, disableNative));
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, internal, disableNative) {
      var _this3 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(typeof data === 'string')) {
                _context2.next = 7;
                break;
              }

              if (!/^[\w:]*\/\//.test(data)) {
                _context2.next = 4;
                break;
              }

              this.nativeRouter.toOutside(data);
              return _context2.abrupt("return");

            case 4:
              location = this.urlToLocation(data);
              _context2.next = 8;
              break;

            case 7:
              if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

            case 8:
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 12;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 12:
              _context2.next = 14;
              return this.dispatch(routeState);

            case 14:
              if (!(!disableNative && !internal)) {
                _context2.next = 18;
                break;
              }

              _context2.next = 17;
              return this.nativeRouter.execute('push', function () {
                var nativeLocation = _this3.locationTransform.out(routeState);

                var nativeUrl = _this3.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key);

            case 17:
              nativeData = _context2.sent;

            case 18:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));

            case 23:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _push(_x4, _x5, _x6) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.replace = function replace(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._replace.bind(this, data, internal, disableNative));
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, internal, disableNative) {
      var _this4 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(typeof data === 'string')) {
                _context3.next = 7;
                break;
              }

              if (!/^[\w:]*\/\//.test(data)) {
                _context3.next = 4;
                break;
              }

              this.nativeRouter.toOutside(data);
              return _context3.abrupt("return");

            case 4:
              location = this.urlToLocation(data);
              _context3.next = 8;
              break;

            case 7:
              if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

            case 8:
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 12;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 12:
              _context3.next = 14;
              return this.dispatch(routeState);

            case 14:
              if (!(!disableNative && !internal)) {
                _context3.next = 18;
                break;
              }

              _context3.next = 17;
              return this.nativeRouter.execute('replace', function () {
                var nativeLocation = _this4.locationTransform.out(routeState);

                var nativeUrl = _this4.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key);

            case 17:
              nativeData = _context3.sent;

            case 18:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _replace(_x7, _x8, _x9) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.back = function back(n, indexUrl, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (indexUrl === void 0) {
      indexUrl = 'index';
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? _basic.routeConfig.indexUrl : indexUrl, internal, disableNative));
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, indexUrl, internal, disableNative) {
      var _this5 = this;

      var stack, uri, _uriToLocation, key, location, routeState, nativeData;

      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

              if (stack) {
                _context4.next = 6;
                break;
              }

              if (!indexUrl) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt("return", this._relaunch(indexUrl || _basic.routeConfig.indexUrl, internal, disableNative));

            case 5:
              throw {
                code: '1',
                message: 'history not found'
              };

            case 6:
              uri = stack.uri;
              _uriToLocation = (0, _basic.uriToLocation)(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = (0, _extends2.default)({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 11;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 11:
              _context4.next = 13;
              return this.dispatch(routeState);

            case 13:
              if (!(!disableNative && !internal)) {
                _context4.next = 17;
                break;
              }

              _context4.next = 16;
              return this.nativeRouter.execute('back', function () {
                var nativeLocation = _this5.locationTransform.out(routeState);

                var nativeUrl = _this5.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, n, key);

            case 16:
              nativeData = _context4.sent;

            case 17:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));
              return _context4.abrupt("return", undefined);

            case 23:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12, _x13) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.taskComplete = function taskComplete() {
    var task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  };

  _proto2.executeTask = function executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  };

  _proto2.addTask = function addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseRouter;
}();

exports.BaseRouter = BaseRouter;