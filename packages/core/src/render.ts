/* eslint-disable no-await-in-loop */
import {MetaData, ModuleGetter, CommonModule, BStore, IStore} from './basic';
import {Module, getModuleByName, loadModel} from './inject';
import {ControllerMiddleware, enhanceStore} from './store';
import {env} from './env';

let reRender: (appView: any) => void = () => undefined;
let reRenderTimer = 0;
let appView: any = null;
/**
 * 当view发生变化时，用来热更新UI
 */
export function viewHotReplacement(moduleName: string, views: {[key: string]: any}) {
  const module = MetaData.moduleGetter[moduleName]() as Module;
  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = (MetaData.moduleGetter[MetaData.appModuleName]() as Module).default.views[MetaData.appViewName];
    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn(`[HMR] @medux view re rendering`);
      }, 0) as any;
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}

const defFun: any = () => undefined;

export function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preLoadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: ControllerMiddleware[],
  appModuleName: string = 'app',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  preLoadModules = preLoadModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  return {
    store,
    async beforeRender() {
      if (reRenderTimer) {
        env.clearTimeout(reRenderTimer);
        reRenderTimer = 0;
      }
      MetaData.clientStore = store;
      await loadModel(appModuleName, store);
      // const appModule = await getModuleByName(appModuleName);
      // appModule.default.model(controller);
      // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
      await Promise.all(preLoadModules.map((moduleName) => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName) as CommonModule;
      return {
        appView: appModule.default.views[appViewName],
        setReRender(hotRender: (appView: any) => void) {
          reRender = hotRender;
        },
      };
    },
  };
}

export function ssrApp<ST extends BStore = BStore>(
  baseStore: ST,
  preLoadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: ControllerMiddleware[],
  appModuleName: string = 'app',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  preLoadModules = preLoadModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  return {
    store,
    async beforeRender() {
      await loadModel(appModuleName, store);
      // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
      // preModules.unshift(appModuleName);
      await Promise.all(preLoadModules.map((moduleName) => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName) as CommonModule;
      store.dispatch = defFun;
      return {appView: appModule.default.views[appViewName]};
    },
  };
}
// export function createApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = any, V = any>(
//   reduceOptions: <T>(options: T) => T,
//   storeCreator: (storeOptions: SO) => ST,
//   render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void,
//   ssr: (store: ST, appView: V, renderOptions: RO) => {html: string; data: any},
//   preModules: string[],
//   moduleGetter: ModuleGetter,
//   appModuleName: string = 'app',
//   appViewName: string = 'main'
// ) {
//   let options: CreateOptions<SO, RO> = {
//     moduleGetter,
//     appModuleName,
//     appViewName,
//   } as any;
//   return {
//     useStore(storeOptions: SO) {
//       options.storeOptions = storeOptions;
//       return {
//         render(renderOptions: RO) {
//           options.renderOptions = renderOptions;
//           options = reduceOptions(options);
//           MetaData.appModuleName = appModuleName;
//           MetaData.appViewName = appViewName;
//           MetaData.moduleGetter = moduleGetter;
//           const controller: IController = new Controller(storeOptions.middlewares);
//           const store = storeCreator(storeOptions);
//           store.dispatch = controller.dispatch;
//           controller.setStore(store);
//           return {
//             store,
//             async run() {
//               if (reRenderTimer) {
//                 env.clearTimeout(reRenderTimer);
//                 reRenderTimer = 0;
//               }
//               MetaData.clientController = controller;
//               const appModule = await getModuleByName(appModuleName);
//               // appModule.default.model(controller);
//               // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//               await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//               reRender = render(store, appModule.default.views[appViewName], renderOptions);
//             },
//           };
//         },
//         ssr(renderOptions: RO) {
//           options.renderOptions = renderOptions;
//           options.isSSR = true;
//           options = reduceOptions(options);
//           MetaData.appModuleName = appModuleName;
//           MetaData.appViewName = appViewName;
//           MetaData.moduleGetter = moduleGetter;
//           const controller: IController = new Controller(storeOptions.middlewares);
//           const store = storeCreator(storeOptions);
//           store.dispatch = controller.dispatch;
//           controller.setStore(store);
//           return {
//             store,
//             async run() {
//               const appModule = await getModuleByName(appModuleName);
//               // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//               // preModules.unshift(appModuleName);
//               await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//               controller.dispatch = defFun;
//               return ssr(store, appModule.default.views[appViewName], renderOptions);
//             },
//           };
//         },
//       };
//     },
//   };
// }

// export function createApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = any, V = any>(
//   storeCreator: (storeOptions: SO) => {store: ST; controller: IController},
//   render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void,
//   ssr: (store: ST, appView: V, renderOptions: RO) => {html: string; data: any},
//   preModules: string[],
//   moduleGetter: ModuleGetter,
//   appModuleName: string = 'app',
//   appViewName: string = 'main'
// ): CreateApp<SO, ST, RO> {
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   return {
//     useStore(storeOptions: SO) {
//       const {store, controller} = storeCreator(storeOptions);
//       return {
//         store,
//         async ssr(renderOptions: RO) {
//           const appModule = await getModuleByName(appModuleName);
//           // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//           // preModules.unshift(appModuleName);
//           await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//           controller.dispatch = defFun;
//           return ssr(store, appModule.default.views[appViewName], renderOptions);
//         },
//         async render(renderOptions: RO) {
//           if (reRenderTimer) {
//             env.clearTimeout(reRenderTimer);
//             reRenderTimer = 0;
//           }
//           MetaData.clientController = controller;
//           const appModule = await getModuleByName(appModuleName);
//           // appModule.default.model(controller);
//           // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//           await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//           reRender = render(store, appModule.default.views[appViewName], renderOptions);
//         },
//       };
//     },
//   };
// }

// /**
//  * 该方法用来创建并启动Client应用
//  * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
//  * @param render 渲染View的回调函数，该回调函数可返回一个reRender的方法用来热更新UI
//  * @param moduleGetter 模块的获取方式
//  * @param appModuleName 模块的主入口模块名称
//  * @param storeOptions store的参数，参见StoreOptions
//  * @param startup 此钩子之前为static代码，此钩子之后开始正式启动
//  */
// export async function renderApp<V>(
//   render: (store: ModuleStore, appView: V) => (appView: V) => void,
//   moduleGetter: ModuleGetter,
//   appModuleOrName: string | CommonModule,
//   appViewName: string,
//   storeOptions: StoreOptions = {},
//   startup: (store: ModuleStore) => void,
//   preModules: string[]
// ): Promise<ModuleStore> {
//   if (reRenderTimer) {
//     env.clearTimeout(reRenderTimer);
//     reRenderTimer = 0;
//   }
//   const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   if (typeof appModuleOrName !== 'string') {
//     cacheModule(appModuleOrName);
//   }
//   const store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
//   startup(store);
//   const appModule = await getModuleByName(appModuleName);
//   appModule.default.model(store);
//   preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//   if (preModules.length) {
//     // SSR时保证所有的module都已经载入
//     await Promise.all(preModules.map((moduleName) => getModuleByName(moduleName)));
//   }
//   reRender = render(store, appModule.default.views[appViewName]);
//   return store;
// }

// /**
//  * SSR时该方法用来创建并启动Server应用
//  * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
//  * @param render 渲染View的回调函数
//  * @param moduleGetter 模块的获取方式
//  * @param appModuleName 模块的主入口模块名称
//  * @param storeOptions store的参数，参见StoreOptions
//  * @param startup 此钩子之前为static代码，此钩子之后开始正式启动
//  */
// export async function renderSSR<V>(
//   render: (store: ModuleStore, appView: V) => {html: any; data: any; store: ModuleStore},
//   moduleGetter: ModuleGetter,
//   appModuleOrName: string | CommonModule,
//   appViewName: string,
//   storeOptions: StoreOptions = {},
//   startup: (store: ModuleStore) => void,
//   preModules: string[]
// ) {
//   const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   if (typeof appModuleOrName !== 'string') {
//     cacheModule(appModuleOrName);
//   }
//   const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
//   startup(store);
//   const appModule = await getModuleByName(appModuleName);
//   preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//   preModules.unshift(appModuleName);
//   await Promise.all(preModules.map((moduleName) => loadModel(moduleName, store)));
//   store.dispatch = defFun;
//   return render(store, appModule.default.views[appViewName]);
// }
