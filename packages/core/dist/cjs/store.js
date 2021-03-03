"use strict";

exports.__esModule = true;
exports.getActionData = getActionData;
exports.isProcessedError = isProcessedError;
exports.setProcessedError = setProcessedError;
exports.buildStore = buildStore;

var _redux = require("redux");

var _basic = require("./basic");

var _inject = require("./inject");

var _env = require("./env");

var _actions = require("./actions");

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

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

function buildStore(preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
  if (preloadedState === void 0) {
    preloadedState = {};
  }

  if (storeReducers === void 0) {
    storeReducers = {};
  }

  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  if (storeEnhancers === void 0) {
    storeEnhancers = [];
  }

  if (_basic.MetaData.clientStore) {
    _basic.MetaData.clientStore.destroy();
  }

  var store;

  var combineReducers = function combineReducers(state, action) {
    if (!store) {
      return state;
    }

    var meta = store._medux_;
    var currentState = meta.currentState;
    var realtimeState = meta.realtimeState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      var node = storeReducers[moduleName](state[moduleName], action);

      if (_basic.config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
        (0, _basic.warn)('Use rewrite instead of replace to update state in MutableData');
      }

      realtimeState[moduleName] = node;
    });
    var handlersCommon = meta.reducerMap[action.type] || {};
    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + _basic.config.NSP + "]+"), '*')] || {};
    var handlers = Object.assign({}, handlersCommon, handlersEvery);
    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [].concat(action.priority) : [];
      var actionData = getActionData(action);
      handlerModules.forEach(function (moduleName) {
        var fun = handlers[moduleName];

        if (moduleName === _basic.MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift.apply(orderList, priority);
      var moduleNameMap = {};
      orderList.forEach(function (moduleName) {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          var fun = handlers[moduleName];
          _basic.MetaData.currentData = {
            actionName: action.type,
            prevState: currentState
          };
          var node = fun.apply(void 0, actionData);

          if (_basic.config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
            (0, _basic.warn)('Use rewrite instead of replace to update state in MutableData');
          }

          realtimeState[moduleName] = node;
        }
      });
    }

    return realtimeState;
  };

  var middleware = function middleware(_ref) {
    var dispatch = _ref.dispatch;
    return function (next) {
      return function (originalAction) {
        if (originalAction.type === _basic.ActionTypes.Error) {
          var actionData = getActionData(originalAction);

          if (isProcessedError(actionData[0])) {
            return originalAction;
          }

          actionData[0] = setProcessedError(actionData[0], true);
        }

        if (_env.env.isServer) {
          if (originalAction.type.split(_basic.config.NSP)[1] === _basic.ActionTypes.MLoading) {
            return originalAction;
          }
        }

        var meta = store._medux_;
        var rootState = store.getState();
        meta.realtimeState = (0, _basic.mergeState)(rootState);
        meta.currentState = (0, _basic.snapshotState)(rootState);
        var currentState = meta.currentState;
        var action = next(originalAction);
        var handlersCommon = meta.effectMap[action.type] || {};
        var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + _basic.config.NSP + "]+"), '*')] || {};
        var handlers = Object.assign({}, handlersCommon, handlersEvery);
        var handlerModules = Object.keys(handlers);

        if (handlerModules.length > 0) {
          var _actionData = getActionData(action);

          var orderList = [];
          var priority = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (moduleName === _basic.MetaData.appModuleName) {
              orderList.unshift(moduleName);
            } else {
              orderList.push(moduleName);
            }

            if (!fun.__isHandler__) {
              priority.unshift(moduleName);
            }
          });
          orderList.unshift.apply(orderList, priority);
          var moduleNameMap = {};
          var promiseResults = [];
          orderList.forEach(function (moduleName) {
            if (!moduleNameMap[moduleName]) {
              moduleNameMap[moduleName] = true;
              var fun = handlers[moduleName];
              _basic.MetaData.currentData = {
                actionName: action.type,
                prevState: currentState
              };
              var effectResult = fun.apply(void 0, _actionData);
              var decorators = fun.__decorators__;

              if (decorators) {
                var results = [];
                decorators.forEach(function (decorator, index) {
                  results[index] = decorator[0](action, moduleName, effectResult);
                });
                fun.__decoratorResults__ = results;
              }

              var errorHandler = effectResult.then(function (reslove) {
                if (decorators) {
                  var _results = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Resolved', _results[index], reslove);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                return reslove;
              }, function (reason) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], reason);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                if (isProcessedError(reason)) {
                  throw reason;
                } else {
                  reason = setProcessedError(reason, false);
                  return dispatch((0, _actions.errorAction)(reason));
                }
              });
              promiseResults.push(errorHandler);
            }
          });

          if (promiseResults.length) {
            return Promise.all(promiseResults);
          }
        }

        return action;
      };
    };
  };

  var preLoadMiddleware = function preLoadMiddleware() {
    return function (next) {
      return function (action) {
        var _action$type$split = action.type.split(_basic.config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && _basic.MetaData.moduleGetter[moduleName]) {
          var hasInjected = store._medux_.injectedModules[moduleName];

          if (!hasInjected) {
            var moduleOrPromise = (0, _inject.getModuleByName)(moduleName);

            if ((0, _basic.isPromise)(moduleOrPromise)) {
              return moduleOrPromise.then(function (module) {
                module.default.model(store);
                return next(action);
              });
            }
          }
        }

        return next(action);
      };
    };
  };

  var middlewareEnhancer = _redux.applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var moduleStore = newStore;
      moduleStore._medux_ = {
        realtimeState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {}
      };
      return newStore;
    };
  };

  var enhancers = [middlewareEnhancer, enhancer].concat(storeEnhancers);

  if (_basic.config.DEVTOOLS && _env.env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_env.env.__REDUX_DEVTOOLS_EXTENSION__(_env.env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = (0, _redux.createStore)(combineReducers, preloadedState, _redux.compose.apply(void 0, enhancers));

  store.destroy = function () {
    return undefined;
  };

  if (!_env.env.isServer) {
    _basic.MetaData.clientStore = store;
  }

  return store;
}