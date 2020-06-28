import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env } from '@medux/core';
import { assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation as _urlToLocation } from '@medux/route-plan-a';

function isBrowserRoutePayload(data) {
  return !data['url'];
}

function isBrowserRoutePayload2(data) {
  return !data['pathname'];
}

function fillLocation(location) {
  return {
    pathname: location.pathname || '',
    search: location.search || '',
    hash: location.hash || '',
    action: location.action
  };
}

export function fillBrowserRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

  if (routePayload.params) {
    stackParams[0] = deepAssign({}, stackParams[0], routePayload.params);
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams, undefined, extend.action);
}
export function createRouter(routeConfig, startupUrl, locationMap) {
  var transformRoute = buildTransformRoute(routeConfig);

  var History = function () {
    function History() {
      _defineProperty(this, "_uid", 0);

      _defineProperty(this, "_listenList", {});

      _defineProperty(this, "_blockerList", {});

      _defineProperty(this, "location", void 0);

      _defineProperty(this, "indexLocation", void 0);

      var url = checkUrl(startupUrl);
      this.location = _urlToLocation(url);
      this.indexLocation = this.location;
    }

    var _proto = History.prototype;

    _proto.getLocation = function getLocation() {
      return this.location;
    };

    _proto.getRouteData = function getRouteData() {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(this.location) : this.location);
    };

    _proto.urlToLocation = function urlToLocation(str) {
      var url = checkUrl(str, this.location.pathname);

      var location = _urlToLocation(url);

      if (locationMap) {
        location = locationMap.out(location);
        url = checkUrl(locationToUrl(location));
      }

      return {
        url: url,
        location: location
      };
    };

    _proto.createWechatRouteOption = function createWechatRouteOption(data) {
      if (typeof data === 'string') {
        var _this$urlToLocation = this.urlToLocation(data),
            url = _this$urlToLocation.url,
            _location = _this$urlToLocation.location;

        return {
          option: {
            url: url
          },
          location: _location
        };
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location2 = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          _location2 = locationMap.out(_location2);
        }

        var _option = {
          url: checkUrl(locationToUrl(_location2))
        };
        return {
          option: _option,
          location: _location2
        };
      } else {
        var _this$urlToLocation2 = this.urlToLocation(data.url),
            _url = _this$urlToLocation2.url,
            _location3 = _this$urlToLocation2.location;

        return {
          option: Object.assign({}, data, {
            url: _url
          }),
          location: _location3
        };
      }
    };

    _proto.switchTab = function switchTab(args) {
      var _this$createWechatRou = this.createWechatRouteOption(args),
          location = _this$createWechatRou.location,
          option = _this$createWechatRou.option;

      return this._dispatch(location, 'PUSH').then(function () {
        env.switchTab(option);
      });
    };

    _proto.reLaunch = function reLaunch(args) {
      var _this$createWechatRou2 = this.createWechatRouteOption(args),
          location = _this$createWechatRou2.location,
          option = _this$createWechatRou2.option;

      return this._dispatch(location, 'PUSH').then(function () {
        env.reLaunch(option);
      });
    };

    _proto.redirectTo = function redirectTo(args) {
      var _this$createWechatRou3 = this.createWechatRouteOption(args),
          location = _this$createWechatRou3.location,
          option = _this$createWechatRou3.option;

      return this._dispatch(location, 'PUSH').then(function () {
        env.redirectTo(option);
      });
    };

    _proto.navigateTo = function navigateTo(args) {
      var _this$createWechatRou4 = this.createWechatRouteOption(args),
          location = _this$createWechatRou4.location,
          option = _this$createWechatRou4.option;

      return this._dispatch(location, 'PUSH').then(function () {
        env.navigateTo(option);
      });
    };

    _proto.navigateBack = function navigateBack(option) {
      var routeOption = typeof option === 'number' ? {
        delta: option
      } : option;
      var pages = env.getCurrentPages();

      if (pages.length < 2) {
        throw {
          code: '1',
          message: 'navigateBack:fail cannot navigate back at first page.'
        };
      }

      var currentPage = pages[pages.length - 1 - (routeOption.delta || 1)];
      var location;

      if (currentPage) {
        var route = currentPage.route,
            options = currentPage.options;
        var search = Object.keys(options).map(function (key) {
          return key + '=' + options[key];
        }).join('&');
        var url = checkUrl(route + '?' + search);
        location = _urlToLocation(url);
      } else {
        location = this.indexLocation;
      }

      return this._dispatch(location, 'POP').then(function () {
        env.navigateBack(routeOption);
      });
    };

    _proto.refresh = function refresh(method) {
      var option = {
        url: this.location.pathname + this.location.search
      };
      return this._dispatch(this.location, 'PUSH').then(function () {
        env[method](option);
      });
    };

    _proto.passive = function passive(location) {
      var _this = this;

      if (!this.equal(location, this.location)) {
        this._dispatch(location, location.action || 'POP').catch(function () {
          env.navigateTo({
            url: _this.location.pathname + _this.location.search
          });
        });
      }
    };

    _proto.equal = function equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    };

    _proto._dispatch = function () {
      var _dispatch2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(location, action) {
        var newLocation, _key, _blocker, result, _key2, _listener;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                newLocation = Object.assign({}, location, {
                  action: action
                });
                _context.t0 = _regeneratorRuntime.keys(this._blockerList);

              case 2:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 13;
                  break;
                }

                _key = _context.t1.value;

                if (!this._blockerList.hasOwnProperty(_key)) {
                  _context.next = 11;
                  break;
                }

                _blocker = this._blockerList[_key];
                _context.next = 8;
                return _blocker(newLocation, this.location);

              case 8:
                result = _context.sent;

                if (result) {
                  _context.next = 11;
                  break;
                }

                throw {
                  code: '2',
                  message: "route blocked:" + location.pathname
                };

              case 11:
                _context.next = 2;
                break;

              case 13:
                this.location = Object.assign({}, location, {
                  action: action
                });

                for (_key2 in this._listenList) {
                  if (this._listenList.hasOwnProperty(_key2)) {
                    _listener = this._listenList[_key2];

                    _listener(this.location);
                  }
                }

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _dispatch(_x, _x2) {
        return _dispatch2.apply(this, arguments);
      }

      return _dispatch;
    }();

    _proto.listen = function listen(listener) {
      var _this2 = this;

      this._uid++;
      var uid = this._uid;
      this._listenList[uid] = listener;
      return function () {
        delete _this2._listenList[uid];
      };
    };

    _proto.block = function block(listener) {
      var _this3 = this;

      this._uid++;
      var uid = this._uid;
      this._blockerList[uid] = listener;
      return function () {
        delete _this3._blockerList[uid];
      };
    };

    return History;
  }();

  var historyActions = new History();
  var historyProxy = {
    initialized: true,
    getLocation: function getLocation() {
      return historyActions.getLocation();
    },
    subscribe: function subscribe(listener) {
      return historyActions.listen(listener);
    },
    locationToRouteData: function locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    equal: function equal(a, b) {
      return historyActions.equal(a, b);
    },
    patch: function patch(location) {
      var url = locationToUrl(location);
      historyActions.reLaunch({
        url: url
      });
    }
  };

  function toBrowserUrl(data) {
    var location;

    if (isBrowserRoutePayload2(data)) {
      location = transformRoute.routeToLocation(fillBrowserRouteData(data));
    } else {
      location = fillLocation(data);
    }

    if (locationMap) {
      location = locationMap.out(location);
    }

    return checkUrl(locationToUrl(location));
  }

  return {
    transformRoute: transformRoute,
    historyProxy: historyProxy,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl
  };
}