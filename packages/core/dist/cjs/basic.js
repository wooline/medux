"use strict";

exports.__esModule = true;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;
exports.setConfig = setConfig;
exports.isPromise = isPromise;
exports.getClientStore = getClientStore;
exports.isServer = isServer;
exports.reducer = reducer;
exports.effect = effect;
exports.logger = logger;
exports.delayPromise = delayPromise;
exports.isProcessedError = isProcessedError;
exports.setProcessedError = setProcessedError;
exports.injectActions = injectActions;
exports.client = exports.ActionTypes = exports.MetaData = exports.config = void 0;

var _sprite = require("./sprite");

var loadings = {};
var depthTime = 2;

function setLoadingDepthTime(second) {
  depthTime = second;
}

function setLoading(item, moduleName, group) {
  if (moduleName === void 0) {
    moduleName = MetaData.appModuleName;
  }

  if (group === void 0) {
    group = 'global';
  }

  if (MetaData.isServer) {
    return item;
  }

  var key = moduleName + config.NSP + group;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(depthTime);
    loadings[key].addListener(_sprite.TaskCountEvent, function (e) {
      var store = MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];

        var _action = actions((_actions = {}, _actions[group] = e.data, _actions));

        store.dispatch(_action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}

var config = {
  NSP: '/',
  VSP: '.',
  MSP: ','
};
exports.config = config;

function setConfig(_config) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}

var MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null
};
exports.MetaData = MetaData;
var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: "medux" + config.NSP + "Error",
  RouteChange: "medux" + config.NSP + "RouteChange"
};
exports.ActionTypes = ActionTypes;
var client = MetaData.isServer ? undefined : typeof window === 'undefined' ? global : window;
exports.client = client;

function isPromise(data) {
  return typeof data === 'object' && typeof data['then'] === 'function';
}

function getClientStore() {
  return MetaData.clientStore;
}

function isServer() {
  return MetaData.isServer;
}

function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}

function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      var before = function before(curAction, moduleName, promiseResult) {
        if (!MetaData.isServer) {
          if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }

          setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}

function logger(before, after) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}

function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}

function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  } else {
    return !!error.meduxProcessed;
  }
}

function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  } else {
    return {
      meduxProcessed: meduxProcessed,
      error: error
    };
  }
}

function bindThis(fun, thisObj) {
  var newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(function (key) {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName, actionName) {
  var actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = function () {
      for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        payload[_key2] = arguments[_key2];
      }

      return {
        type: moduleName + config.NSP + actionName,
        payload: payload
      };
    };
  }
}

function injectActions(store, moduleName, handlers) {
  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          handler = bindThis(handler, handlers);
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

            if (arr[1]) {
              handler.__isHandler__ = true;
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            } else {
              handler.__isHandler__ = false;
              transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
              addModuleActionCreatorList(moduleName, actionName);
            }
          });
        }
      })();
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}