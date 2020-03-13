import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, client, config, injectActions, isPromise, reducer } from './basic';
import { buildStore, loadModel as _loadModel } from './store';
export const exportModule = (moduleName, initState, ActionHandles, views) => {
  const model = (store, options) => {
    const hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      const moduleState = store.getState()[moduleName];
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers);
      handlers.actions = actions;

      if (!moduleState) {
        const params = store._medux_.prevState.route.data.params;
        initState.isModule = true;
        const initAction = actions.Init(initState, params[moduleName], options);
        return store.dispatch(initAction);
      }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(moduleName, store) {
      this.moduleName = moduleName;
      this.store = store;

      _initialize(this);
    }

  }

  return {
    F: BaseModelHandlers,
    d: [{
      kind: "field",
      key: "actions",

      value() {
        return null;
      }

    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.getState();
      } //ie8不支持getter

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
      } //ie8不支持getter

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
      } //ie8不支持getter

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
      } //ie8不支持getter

    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "beforeState",
      value: function beforeState() {
        return this.getBeforeState();
      } //ie8不支持getter

    }, {
      kind: "method",
      key: "getBeforeState",
      value: function getBeforeState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "beforeRootState",
      value: function beforeRootState() {
        return this.getBeforeRootState();
      } //ie8不支持getter

    }, {
      kind: "method",
      key: "getBeforeRootState",
      value: function getBeforeRootState() {
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
      moduleGetter[moduleName] = () => module;

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
      //在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
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

export function renderApp(render, moduleGetter, appModuleName, history, storeOptions = {}) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};

  if (storeOptions.initData || client[ssrInitStoreKey]) {
    initData = Object.assign({}, client[ssrInitStoreKey], {}, storeOptions.initData);
  }

  const store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const reduxStore = store;
  const preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appModuleName && initData[key].isModule));
  } // 在ssr时，client必须在第一次render周期中完成和ssr一至的输出结构，所以不能出现异步模块


  return getModuleListByNames(preModuleNames, moduleGetter).then(([appModule]) => {
    const initModel = appModule.default.model(store, undefined);
    render(reduxStore, appModule.default.model, appModule.default.views, ssrInitStoreKey);

    if (isPromise(initModel)) {
      return initModel.then(() => reduxStore);
    } else {
      return reduxStore;
    }
  });
}
export async function renderSSR(render, moduleGetter, appModuleName, history, storeOptions = {}) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const storeState = store.getState();
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
      await module.default.model(store, undefined);

      if (i === 0) {
        appModule = module;
      }
    }
  }

  return render(store, appModule.default.model, appModule.default.views, ssrInitStoreKey);
}