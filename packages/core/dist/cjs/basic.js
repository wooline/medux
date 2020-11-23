"use strict";

exports.__esModule = true;
exports.setConfig = setConfig;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;
exports.reducer = reducer;
exports.effect = effect;
exports.logger = logger;
exports.delayPromise = delayPromise;
exports.isPromise = isPromise;
exports.isServer = isServer;
exports.MetaData = exports.ActionTypes = exports.config = void 0;

var _sprite = require("./sprite");

var _env = require("./env");

var config = {
  VSP: '.',
  NSP: '.',
  MSP: ','
};
exports.config = config;

function setConfig(_config) {
  _config.VSP && (config.VSP = _config.VSP);
  _config.NSP && (config.NSP = _config.NSP);
  _config.MSP && (config.MSP = _config.MSP);
}

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  Error: "medux" + config.NSP + "Error"
};
exports.ActionTypes = ActionTypes;
var MetaData = {
  appViewName: null,
  facadeMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null
};
exports.MetaData = MetaData;
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

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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