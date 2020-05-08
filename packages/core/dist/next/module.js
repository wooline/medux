import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, cacheModule, client, config, injectActions, isPromise, reducer } from './basic';
import { buildStore, loadModel as _loadModel } from './store';

function clearHandlers(key, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

export function modelHotReplacement(moduleName, initState, ActionHandles) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];
  initState.isModule = true;

  if (prevInitState) {
    if (JSON.stringify(prevInitState) !== JSON.stringify(initState)) {
      console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }

    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles(moduleName, store);
    const actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;
    console.log(`[HMR] @medux Updated model actionHandles: ${moduleName}`);
  }
}

let reRender = () => void 0;

let reRenderTimer = 0;
let appView = null;
export function viewHotReplacement(moduleName, views) {
  const moduleGetter = MetaData.moduleGetter[moduleName];
  const module = moduleGetter['__module__'];

  if (module) {
    module.default.views = views;
    console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views.Main;

    if (!reRenderTimer) {
      reRenderTimer = setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        console.warn(`[HMR] @medux view re rendering`);
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
export const exportModule = (moduleName, initState, ActionHandles, views) => {
  const model = (store, options) => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      var _store$_medux_$prevSt;

      store._medux_.injectedModules[moduleName] = initState;
      let moduleState = store.getState()[moduleName];
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers);
      handlers.actions = actions;
      const params = ((_store$_medux_$prevSt = store._medux_.prevState.route) === null || _store$_medux_$prevSt === void 0 ? void 0 : _store$_medux_$prevSt.data.params) || {};

      if (!moduleState) {
        moduleState = initState;
        moduleState.isModule = true;
      } else {
        moduleState = Object.assign({}, moduleState, {
          isHydrate: true
        });
      }

      const initAction = actions.Init(moduleState, params[moduleName], options);
      return store.dispatch(initAction);
    }

    return void 0;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  const actions = {};
  return {
    moduleName,
    model,
    views,
    actions
  };
};
export let BaseModelHandlers = _decorate(null, function (_initialize) {
  class BaseModelHandlers {
    constructor(moduleName, store) {
      this.moduleName = moduleName;
      this.store = store;

      _initialize(this);

      this.actions = null;
    }

  }

  return {
    F: BaseModelHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.getState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store._medux_.prevState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.getRootState();
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store._medux_.prevState;
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.getCurrentState();
      }
    }, {
      kind: "method",
      key: "getCurrentState",
      value: function getCurrentState() {
        return this.store._medux_.currentState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.getCurrentRootState();
      }
    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return this.getPrevState();
      }
    }, {
      kind: "method",
      key: "getPrevState",
      value: function getPrevState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return this.getPrevRootState();
      }
    }, {
      kind: "method",
      key: "getPrevRootState",
      value: function getPrevRootState() {
        return this.store._medux_.beforeState;
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "callThisAction",
      value: function callThisAction(handler, ...rest) {
        const actions = MetaData.actionCreatorMap[this.moduleName];
        return actions[handler.__actionName__](...rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), {}, payload)));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName, options) {
        return _loadModel(moduleName, this.store, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState, routeParams, options) {
        if (initState.isHydrate) {
          return initState;
        }

        return Object.assign({}, initState, {
          routeParams: routeParams || initState.routeParams
        }, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        const state = this.getState();
        return Object.assign({}, state, {
          routeParams: payload
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, {}, payload)
        });
      }
    }]
  };
});
export function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}
export function isPromiseView(moduleView) {
  return typeof moduleView['then'] === 'function';
}
export function exportActions(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
    maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
      get: (target, key) => {
        return (...payload) => ({
          type: moduleName + config.NSP + key,
          payload
        });
      },
      set: () => {
        return true;
      }
    });
    return maps;
  }, {});
  return MetaData.actionCreatorMap;
}
export function getView(moduleName, viewName, modelOptions) {
  const moduleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(module => {
      moduleGetter[moduleName] = cacheModule(module);
      const view = module.default.views[viewName];

      if (MetaData.isServer) {
        return view;
      }

      const initModel = module.default.model(MetaData.clientStore, modelOptions);

      if (isPromise(initModel)) {
        return initModel.then(() => view);
      } else {
        return view;
      }
    });
  } else {
    cacheModule(result, moduleGetter[moduleName]);
    const view = result.default.views[viewName];

    if (MetaData.isServer) {
      return view;
    }

    const initModel = result.default.model(MetaData.clientStore, modelOptions);

    if (isPromise(initModel)) {
      return initModel.then(() => view);
    } else {
      return view;
    }
  }
}

function getModuleByName(moduleName, moduleGetter) {
  const result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(module => {
      moduleGetter[moduleName] = cacheModule(module);
      return module;
    });
  } else {
    cacheModule(result, moduleGetter[moduleName]);
    return result;
  }
}

export async function renderApp(render, moduleGetter, appModuleName, history, storeOptions = {}, beforeRender) {
  if (reRenderTimer) {
    clearTimeout(reRenderTimer);
    reRenderTimer = 0;
  }

  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};

  if (storeOptions.initData || client[ssrInitStoreKey]) {
    initData = Object.assign({}, client[ssrInitStoreKey], {}, storeOptions.initData);
  }

  const store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appModuleName && initData[key].isModule));
  }

  let appModule = undefined;

  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = await getModuleByName(moduleName, moduleGetter);
    await module.default.model(reduxStore, undefined);

    if (i === 0) {
      appModule = module;
    }
  }

  reRender = render(reduxStore, appModule.default.model, appModule.default.views.Main, ssrInitStoreKey);
}
export async function renderSSR(render, moduleGetter, appModuleName, history, storeOptions = {}, beforeRender) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState = reduxStore.getState();
  const {
    paths
  } = storeState.route.data;
  paths.length === 0 && paths.push(appModuleName);
  let appModule = undefined;
  const inited = {};

  for (let i = 0, k = paths.length; i < k; i++) {
    const [moduleName] = paths[i].split(config.VSP);

    if (!inited[moduleName]) {
      inited[moduleName] = true;
      const module = moduleGetter[moduleName]();
      await module.default.model(reduxStore, undefined);

      if (i === 0) {
        appModule = module;
      }
    }
  }

  return render(reduxStore, appModule.default.model, appModule.default.views.Main, ssrInitStoreKey);
}