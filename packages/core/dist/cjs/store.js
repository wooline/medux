"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isProcessedError = isProcessedError;
exports.setProcessedError = setProcessedError;
exports.getActionData = getActionData;
exports.Controller = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _env = require("./env");

var _sprite = require("./sprite");

var _basic = require("./basic");

var _actions = require("./actions");

var _inject = require("./inject");

function isProcessedError(error) {
  return error && !!error.__meduxProcessed__;
}

function setProcessedError(error, meduxProcessed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, '__meduxProcessed__', {
    value: meduxProcessed,
    enumerable: false,
    writable: true
  });
  return error;
}

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

var Controller = function () {
  function Controller(middlewares) {
    var _this = this;

    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "prevData", void 0);
    (0, _defineProperty2.default)(this, "injectedModules", {});
    (0, _defineProperty2.default)(this, "dispatch", function () {
      throw new Error('Dispatching while constructing your middleware is not allowed.');
    });
    (0, _defineProperty2.default)(this, "getState", function (moduleName) {
      return _this.store.getState(moduleName);
    });
    (0, _defineProperty2.default)(this, "preMiddleware", function () {
      return function (next) {
        return function (action) {
          if (action.type === _basic.ActionTypes.Error) {
            var error = getActionData(action)[0];
            setProcessedError(error, true);
          }

          var _action$type$split = action.type.split(_basic.config.NSP),
              moduleName = _action$type$split[0],
              actionName = _action$type$split[1];

          if (_env.env.isServer && actionName === _basic.ActionTypes.MLoading) {
            return undefined;
          }

          if (moduleName && actionName && _basic.MetaData.moduleGetter[moduleName]) {
            if (!_this.injectedModules[moduleName]) {
              var result = (0, _inject.loadModel)(moduleName, _this);

              if ((0, _sprite.isPromise)(result)) {
                return result.then(function () {
                  return next(action);
                });
              }
            }
          }

          return next(action);
        };
      };
    });
    this.middlewares = middlewares;
    var middlewareAPI = {
      getState: this.getState,
      dispatch: function dispatch(action) {
        return _this.dispatch(action);
      }
    };
    var arr = middlewares ? [this.preMiddleware].concat(middlewares) : [this.preMiddleware];
    var chain = arr.map(function (middleware) {
      return middleware(middlewareAPI);
    });
    this.dispatch = compose.apply(void 0, chain)(this._dispatch.bind(this));
  }

  var _proto = Controller.prototype;

  _proto.setStore = function setStore(store) {
    this.store = store;
  };

  _proto.respondHandler = function respondHandler(action, isReducer, prevData) {
    var _this2 = this;

    var handlersMap = isReducer ? _basic.MetaData.reducersMap : _basic.MetaData.effectsMap;
    var actionName = action.type;

    var _actionName$split = actionName.split(_basic.config.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + _basic.config.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];
    var handlers = (0, _extends2.default)({}, commonHandlers, universalHandlers);
    var handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === _basic.MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift.apply(orderList, action.priority);
      }

      var implemented = {};
      var actionData = getActionData(action);

      if (isReducer) {
        this.prevData = prevData;
        var newState = {};
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = _this2.injectedModules[moduleName];
            newState[moduleName] = handler.apply(modelInstance, actionData);
          }
        });
        this.store.update(actionName, newState, actionData);
      } else {
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = _this2.injectedModules[moduleName];
            _this2.prevData = prevData;
            result.push(_this2.applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  };

  _proto.applyEffect = function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    var _this3 = this;

    var effectResult = handler.apply(modelInstance, actionData);
    var decorators = handler.__decorators__;

    if (decorators) {
      var results = [];
      decorators.forEach(function (decorator, index) {
        results[index] = decorator[0](action, moduleName, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(function (reslove) {
      if (decorators) {
        var _results = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1]('Resolved', _results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, function (error) {
      if (decorators) {
        var _results2 = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1]('Rejected', _results2[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return _this3.dispatch((0, _actions.errorAction)(setProcessedError(error, false)));
      }
    });
  };

  _proto._dispatch = function _dispatch(action) {
    var prevData = {
      actionName: action.type,
      prevState: this.getState()
    };
    this.respondHandler(action, true, prevData);
    return this.respondHandler(action, false, prevData);
  };

  return Controller;
}();

exports.Controller = Controller;