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
export class Controller {
  constructor(actionDecorator) {
    _defineProperty(this, "store", void 0);

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "prevData", void 0);

    _defineProperty(this, "injectedModules", {});

    this.actionDecorator = actionDecorator;
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

  dispatch(action) {
    if (this.actionDecorator) {
      action = this.actionDecorator(action);
    }

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
          return result.then(() => this.executeAction(action));
        }
      }
    }

    return this.executeAction(action);
  }

  executeAction(action) {
    const prevData = {
      actionName: action.type,
      prevState: this.state
    };
    this.respondHandler(action, true, prevData);
    return this.respondHandler(action, false, prevData);
  }

}