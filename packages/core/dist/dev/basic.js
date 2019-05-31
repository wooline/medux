import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.split";
import "core-js/modules/web.dom-collections.for-each";
import "core-js/modules/web.dom-collections.iterator";

/*global global:true process:true*/
import { setLoading } from './loading';
export var NSP = '/'; // export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;

export var MetaData = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: {},
  clientStore: null,
  appModuleName: null
};
export var client = MetaData.isServer ? undefined : window || global;
export function getModuleActionCreatorList(namespace) {
  // if (window["Proxy"]) {
  //   actions = new window["Proxy"](
  //     {},
  //     {
  //       get: (target: {}, key: string) => {
  //         return (data: any) => ({ type: namespace + "/" + key, data });
  //       }
  //     }
  //   );
  // } else {
  //   actions = getModuleActions(namespace) as any;
  // }
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    var obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}
export function isPromise(data) {
  return typeof data['then'] === 'function';
}
export function getClientStore() {
  return MetaData.clientStore;
}
export function isServer() {
  return MetaData.isServer;
}
export function reducer(target, key, descriptor) {
  var fun = descriptor.value;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return descriptor;
}
export function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
  }

  return function (target, key, descriptor) {
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

    return descriptor;
  };
}
export function logger(before, after) {
  return function (target, key, descriptor) {
    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
export function delayPromise(second) {
  return function (target, propertyKey, descriptor) {
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

function addModuleActionCreatorList(namespace, actionName) {
  var actions = getModuleActionCreatorList(namespace);

  if (!actions[actionName]) {
    actions[actionName] = function (payload) {
      return {
        type: namespace + NSP + actionName,
        payload: payload
      };
    };
  }
}

export function injectActions(store, namespace, handlers) {
  for (var _actionName in handlers) {
    if (typeof handlers[_actionName] === 'function') {
      var handler = handlers[_actionName];

      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);

        var arr = _actionName.split(NSP);

        if (arr[1]) {
          handler.__isHandler__ = true;
          transformAction(_actionName, handler, namespace, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
        } else {
          handler.__isHandler__ = false;
          transformAction(namespace + NSP + _actionName, handler, namespace, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          addModuleActionCreatorList(namespace, _actionName);
        }
      }
    }
  }

  return getModuleActionCreatorList(namespace);
}
//# sourceMappingURL=basic.js.map