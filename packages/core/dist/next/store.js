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

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

export class Controller {
  constructor(middlewares) {
    _defineProperty(this, "store", void 0);

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "prevData", void 0);

    _defineProperty(this, "injectedModules", {});

    _defineProperty(this, "dispatch", () => {
      throw new Error('Dispatching while constructing your middleware is not allowed.');
    });

    _defineProperty(this, "getState", () => {
      return this.state;
    });

    _defineProperty(this, "preMiddleware", () => next => action => {
      if (action.type === ActionTypes.Error) {
        const error = getActionData(action)[0];
        setProcessedError(error, true);
      }

      const [moduleName, actionName] = action.type.split(config.NSP);

      if (env.isServer && actionName === ActionTypes.MLoading) {
        return undefined;
      }

      if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
        if (!this.injectedModules[moduleName]) {
          const result = loadModel(moduleName, this);

          if (isPromise(result)) {
            return result.then(() => next(action));
          }
        }
      }

      return next(action);
    });

    this.middlewares = middlewares;
    const middlewareAPI = {
      getState: this.getState,
      dispatch: action => this.dispatch(action)
    };
    const arr = middlewares ? [this.preMiddleware, ...middlewares] : [this.preMiddleware];
    const chain = arr.map(middleware => middleware(middlewareAPI));
    this.dispatch = compose(...chain)(this._dispatch.bind(this));
  }

  setStore(store) {
    this.store = store;
    this.state = store.getState();
  }

  respondHandler(action, isReducer, prevData) {
    const handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    const actionName = action.type;
    const [actionModuleName] = actionName.split(config.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${config.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = { ...commonHandlers,
      ...universalHandlers
    };
    const handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      const orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift(...action.priority);
      }

      const implemented = {};
      const actionData = getActionData(action);

      if (isReducer) {
        this.prevData = prevData;
        const newState = {};
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = this.injectedModules[moduleName];
            newState[moduleName] = handler.apply(modelInstance, actionData);
          }
        });
        this.store.update(actionName, newState, actionData);
        this.state = this.store.getState();
      } else {
        const result = [];
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = this.injectedModules[moduleName];
            this.prevData = prevData;
            result.push(this.applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  }

  applyEffect(moduleName, handler, modelInstance, action, actionData) {
    const effectResult = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;

    if (decorators) {
      const results = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0](action, moduleName, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(reslove => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1]('Resolved', results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, error => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1]('Rejected', results[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return this.dispatch(errorAction(setProcessedError(error, false)));
      }
    });
  }

  _dispatch(action) {
    const prevData = {
      actionName: action.type,
      prevState: this.state
    };
    this.respondHandler(action, true, prevData);
    return this.respondHandler(action, false, prevData);
  }

}