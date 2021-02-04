"use strict";

exports.__esModule = true;
exports.setConfig = setConfig;
exports.warn = warn;
exports.deepMergeState = deepMergeState;
exports.mergeState = mergeState;
exports.snapshotState = snapshotState;
exports.getAppModuleName = getAppModuleName;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;
exports.reducer = reducer;
exports.effect = effect;
exports.logger = logger;
exports.delayPromise = delayPromise;
exports.isPromise = isPromise;
exports.isServer = isServer;
exports.serverSide = serverSide;
exports.clientSide = clientSide;
exports.MetaData = exports.ActionTypes = exports.config = void 0;

var _sprite = require("./sprite");

var _env = require("./env");

var config = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DEVTOOLS: process.env.NODE_ENV === 'development'
};
exports.config = config;

function setConfig(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DEVTOOLS !== undefined && (config.DEVTOOLS = _config.DEVTOOLS);
}

function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    _env.env.console.warn(str);
  }
}

function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (config.MutableData) {
    return _sprite.deepMerge.apply(void 0, [target].concat(args));
  }

  return _sprite.deepMerge.apply(void 0, [{}, target].concat(args));
}

function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (config.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}

function snapshotState(target) {
  if (config.MutableData) {
    return JSON.parse(JSON.stringify(target));
  }

  return target;
}

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: "medux" + config.NSP + "Error"
};
exports.ActionTypes = ActionTypes;
var MetaData = {
  appViewName: null,
  facadeMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null,
  currentData: {
    actionName: '',
    prevState: null
  }
};
exports.MetaData = MetaData;

function getAppModuleName() {
  return MetaData.appModuleName;
}

var loadings = {};
var depthTime = 2;

function setLoadingDepthTime(second) {
  depthTime = second;
}

function setLoading(item, moduleName, groupName) {
  if (moduleName === void 0) {
    moduleName = MetaData.appModuleName;
  }

  if (groupName === void 0) {
    groupName = 'global';
  }

  if (_env.isServerEnv) {
    return item;
  }

  var key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(depthTime);
    loadings[key].addListener(_sprite.TaskCountEvent, function (e) {
      var store = MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = MetaData.facadeMap[moduleName].actions[ActionTypes.MLoading];

        var _action = actions((_actions = {}, _actions[groupName] = e.data, _actions));

        store.dispatch(_action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
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
    loadingForModuleName = MetaData.appModuleName || '';
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
        if (!_env.isServerEnv) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (!loadingForModuleName) {
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
        _env.env.setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}

function isServer() {
  return _env.isServerEnv;
}

function serverSide(callback) {
  if (_env.isServerEnv) {
    return callback();
  }

  return undefined;
}

function clientSide(callback) {
  if (!_env.isServerEnv) {
    return callback();
  }

  return undefined;
}