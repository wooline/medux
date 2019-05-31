import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class, _temp;

import { reducer, getModuleActionCreatorList, isPromise, injectActions, MetaData } from './basic';
import { buildStore } from './store';
import { errorAction } from './actions';
export function exportModule(namespace) {
  const actions = getModuleActionCreatorList(namespace);
  return {
    namespace,
    actions
  };
}
export let BaseModuleHandlers = (_class = (_temp = class BaseModuleHandlers {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(initState, presetData) {
    this.initState = void 0;
    this.namespace = '';
    this.store = null;
    this.actions = null;
    initState.isModule = true;
    this.initState = initState;
  }

  get state() {
    return this.store._medux_.prevState[this.namespace];
  }

  get rootState() {
    return this.store._medux_.prevState;
  }

  get currentState() {
    return this.store._medux_.currentState[this.namespace];
  }

  get currentRootState() {
    return this.store._medux_.currentState;
  }

  dispatch(action) {
    return this.store.dispatch(action);
  }

  callThisAction(handler) {
    const actions = getModuleActionCreatorList(this.namespace);
    return actions[handler.__actionName__](arguments.length <= 1 ? undefined : arguments[1]);
  }

  INIT(payload) {
    return payload;
  }

  UPDATE(payload) {
    return payload;
  }

  LOADING(payload) {
    const state = this.state;

    if (!state) {
      return state;
    }

    return _objectSpread({}, state, {
      loading: _objectSpread({}, state.loading, payload)
    });
  }

  updateState(payload) {
    this.dispatch(this.callThisAction(this.UPDATE, _objectSpread({}, this.state, payload)));
  }

}, _temp), (_applyDecoratedDescriptor(_class.prototype, "INIT", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "INIT"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "UPDATE", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "UPDATE"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "LOADING", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "LOADING"), _class.prototype)), _class);
export function exportModel(namespace, HandlersClass, initState) {
  const fun = store => {
    const hasInjected = store._medux_.injectedModules[namespace];

    if (!hasInjected) {
      store._medux_.injectedModules[namespace] = true;
      const moduleState = store.getState()[namespace];
      const handlers = new HandlersClass(initState, moduleState);
      handlers.namespace = namespace;
      handlers.store = store;
      const actions = injectActions(store, namespace, handlers);
      handlers.actions = actions;

      if (!moduleState) {
        const initAction = actions.INIT(handlers.initState);
        const action = store.dispatch(initAction);

        if (isPromise(action)) {
          return action;
        } else {
          return Promise.resolve(void 0);
        }
      } else {
        return Promise.resolve(void 0);
      }
    } else {
      return Promise.resolve(void 0);
    }
  };

  fun.namespace = namespace;
  fun.initState = initState;
  return fun;
}
export function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}
export function isPromiseView(moduleView) {
  return typeof moduleView['then'] === 'function';
}
export function loadModel(getModule) {
  const result = getModule();

  if (isPromiseModule(result)) {
    return result.then(module => module.model);
  } else {
    return Promise.resolve(result.model);
  }
}
export function getView(getModule, viewName) {
  const result = getModule();

  if (isPromiseModule(result)) {
    return result.then(module => module.views[viewName]);
  } else {
    return result.views[viewName];
  }
}

function getModuleByName(moduleName, moduleGetter) {
  const result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(module => {
      moduleGetter[moduleName] = () => module;

      return module;
    });
  } else {
    return result;
  }
}

function getModuleListByNames(moduleNames, moduleGetter) {
  const preModules = moduleNames.map(moduleName => {
    const module = getModuleByName(moduleName, moduleGetter);

    if (isPromiseModule(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}

export function renderApp(render, moduleGetter, appModuleName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};

  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = _objectSpread({}, window[ssrInitStoreKey], storeOptions.initData);
  }

  const store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appModuleName && initData[key].isModule));
  }

  return getModuleListByNames(preModuleNames, moduleGetter).then((_ref) => {
    let [appModule] = _ref;
    const initModel = appModule.model(store);
    render(store, appModule.model, appModule.views, ssrInitStoreKey);
    return initModel;
  });
}
export function renderSSR(render, moduleGetter, appModuleName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const appModule = moduleGetter[appModuleName]();
  return appModule.model(store).catch(err => {
    return store.dispatch(errorAction(err));
  }).then(() => {
    return render(store, appModule.model, appModule.views, ssrInitStoreKey);
  });
}
//# sourceMappingURL=module.js.map