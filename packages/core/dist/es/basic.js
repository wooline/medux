/*global global:true process:true*/
import { setLoading } from './loading'; // export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;

export const config = {
  NSP: '/',
  VSP: '.',
  MSP: ','
};
export function setConfig(_config) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}
export const MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: null,
  clientStore: null,
  appModuleName: null,
  moduleGetter: null,
  defaultRouteParams: {}
};
export const defaultRouteParams = MetaData.defaultRouteParams;
export const client = MetaData.isServer ? undefined : typeof window === 'undefined' ? global : window;
export function isPromise(data) {
  return typeof data === 'object' && typeof data['then'] === 'function';
}
export function getStore() {
  return MetaData.clientStore;
}
export function isServer() {
  return MetaData.isServer;
}
export function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  const fun = descriptor.value;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
export function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      const before = (curAction, moduleName, promiseResult) => {
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
export function logger(before, after) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
export function delayPromise(second) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    descriptor.value = function () {
      const delay = new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(items => {
        return items[1];
      });
    };
  };
}
export function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  } else {
    return !!error.meduxProcessed;
  }
}
export function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  } else {
    return {
      meduxProcessed,
      error
    };
  }
}

function bindThis(fun, thisObj) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
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
  const actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = payload => ({
      type: moduleName + config.NSP + actionName,
      payload
    });
  }
}

export function injectActions(store, moduleName, handlers) {
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      let handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        actionNames.split(config.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
          const arr = actionName.split(config.NSP);

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
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}
//# sourceMappingURL=basic.js.map