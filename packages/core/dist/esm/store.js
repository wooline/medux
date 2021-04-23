import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env } from './env';
import { isPromise } from './sprite';
import { ActionTypes, config, MetaData } from './basic';
import { errorAction } from './actions';
import { loadModel } from './inject';
export function isProcessedError(error) {
  return error && !!error.__meduxProcessed__;
}
export function setProcessedError(error, meduxProcessed) {
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
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
export function snapshotData(data) {
  return data;
}
export var Controller = function () {
  function Controller(actionDecorator) {
    _defineProperty(this, "store", void 0);

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "prevData", void 0);

    _defineProperty(this, "injectedModules", {});

    this.actionDecorator = actionDecorator;
  }

  var _proto = Controller.prototype;

  _proto.setStore = function setStore(store) {
    this.store = store;
    this.state = store.getState();
  };

  _proto.respondHandler = function respondHandler(action, isReducer, prevData) {
    var _this = this;

    var handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    var actionName = action.type;

    var _actionName$split = actionName.split(config.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + config.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];

    var handlers = _extends({}, commonHandlers, universalHandlers);

    var handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === MetaData.appModuleName) {
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
            var modelInstance = _this.injectedModules[moduleName];
            newState[moduleName] = handler.apply(modelInstance, actionData);
          }
        });
        this.store.update(actionName, newState, actionData);
        this.state = this.store.getState();
      } else {
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = _this.injectedModules[moduleName];
            _this.prevData = prevData;
            result.push(_this.applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  };

  _proto.applyEffect = function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    var _this2 = this;

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
        return _this2.dispatch(errorAction(setProcessedError(error, false)));
      }
    });
  };

  _proto.dispatch = function dispatch(action) {
    var _this3 = this;

    if (this.actionDecorator) {
      action = this.actionDecorator(action);
    }

    if (action.type === ActionTypes.Error) {
      var error = getActionData(action)[0];
      setProcessedError(error, true);
    }

    var _action$type$split = action.type.split(config.NSP),
        moduleName = _action$type$split[0],
        actionName = _action$type$split[1];

    if (env.isServer && actionName === ActionTypes.MLoading) {
      return undefined;
    }

    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      if (!this.injectedModules[moduleName]) {
        var result = loadModel(moduleName, this);

        if (isPromise(result)) {
          return result.then(function () {
            return _this3.executeAction(action);
          });
        }
      }
    }

    return this.executeAction(action);
  };

  _proto.executeAction = function executeAction(action) {
    var prevData = {
      actionName: action.type,
      prevState: this.state
    };
    this.respondHandler(action, true, prevData);
    return this.respondHandler(action, false, prevData);
  };

  return Controller;
}();