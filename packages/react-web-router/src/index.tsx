/* eslint-disable import/order */
import './env';
import React from 'react';
import {unmountComponentAtNode, hydrate, render} from 'react-dom';
import {routeMiddleware, setRouteConfig} from '@medux/route-web';
import {env, renderApp, ssrApp, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {createRouter} from '@medux/route-browser';

import {setLoadViewOptions} from './loadView';
// import {appExports} from './sington';

import type {ComponentType} from 'react';
import type {ModuleGetter, ExportModule, ControllerMiddleware, StoreBuilder, IStoreOptions, IStore} from '@medux/core';
import type {LocationTransform} from '@medux/route-web';

// import type {ServerRequest, ServerResponse} from './sington';

export type {RootModuleFacade, Dispatch, CoreModuleState} from '@medux/core';
export type {Store} from 'redux';
export type {
  RouteState,
  PayloadLocation,
  LocationTransform,
  NativeLocation,
  PagenameMap,
  HistoryAction,
  Location,
  DeepPartial,
} from '@medux/route-web';
export type {LoadView} from './loadView';
export type {FacadeExports, ServerRequest, ServerResponse} from './sington';

export {
  ActionTypes,
  LoadingState,
  modelHotReplacement,
  env,
  effect,
  errorAction,
  reducer,
  viewHotReplacement,
  setLoading,
  logger,
  isServer,
  serverSide,
  clientSide,
  deepMerge,
  deepMergeState,
  isProcessedError,
  setProcessedError,
} from '@medux/core';
export {RouteModuleHandlers as BaseModuleHandlers, createLocationTransform, RouteActionTypes} from '@medux/route-web';
export {exportApp, patchActions} from './sington';
export {DocumentHead} from './components/DocumentHead';
export {Else} from './components/Else';
export {Switch} from './components/Switch';
export {Link} from './components/Link';

declare const require: any;

let SSRTPL: string;

export function setSsrHtmlTpl(tpl: string) {
  SSRTPL = tpl;
}

export function setConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: {[key: string]: string};
  NSP?: string;
  MSP?: string;
  MutableData?: boolean;
  DepthTimeOnLoading?: number;
  LoadViewOnError?: ComponentType<{message: string}>;
  LoadViewOnLoading?: ComponentType<{}>;
  disableNativeRoute?: boolean;
}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;

export interface RenderOptions {
  id?: string;
  ssrKey?: string;
}
export interface SSROptions {
  id?: string;
  ssrKey?: string;
  url: string;
}

interface RouteOptions {
  locationTransform: LocationTransform<any>;
}

export function createApp(
  moduleGetter: ModuleGetter,
  middlewares: ControllerMiddleware[] = [],
  appModuleName: string = 'app',
  appViewName: string = 'main'
) {
  const controllerMiddleware = [routeMiddleware, ...middlewares];
  return {
    useRoute({locationTransform}: RouteOptions) {
      return {
        useStore<O extends IStoreOptions = IStoreOptions, T extends IStore = IStore>({storeOptions, storeCreator}: StoreBuilder<O, T>) {
          return {
            render({id = 'root', ssrKey = 'meduxInitStore'}: RenderOptions = {}) {
              const router = createRouter('Browser', locationTransform);
              const routeState = router.getRouteState();
              const ssrData = env[ssrKey];
              const renderFun = ssrData ? hydrate : render;
              const panel = env.document.getElementById(id);
              const initState = {...storeOptions.initState, route: routeState, ...ssrData};
              const store = storeCreator({...storeOptions, initState});
              router.setStore(store);
              const runApp = renderApp(store, Object.keys(initState), moduleGetter, controllerMiddleware, appModuleName, appViewName);
              return {
                store,
                run() {
                  return runApp().then(({appView, setReRender}) => {
                    const reRender = (View: ComponentType<any>) => {
                      unmountComponentAtNode(panel!);
                      renderFun(<View store={store} />, panel);
                    };
                    reRender(appView);
                    setReRender(reRender);
                  });
                },
              };
            },
            ssr({id = 'root', ssrKey = 'meduxInitStore', url}: SSROptions) {
              if (!SSRTPL) {
                SSRTPL = env.decodeBas64('process.env.MEDUX_ENV_SSRTPL');
              }
              const router = createRouter(url, locationTransform);
              const routeState = router.getRouteState();
            },
          };
        },
      };
    },
  };
  // return {
  //   useStore({initState = {}, enhancers = []}: Partial<ReduxOptions> = {}) {
  //     return {
  //       useRoute({locationTransform}: RouteOptions) {
  //         return {
  //           render({id = 'root', ssrKey = 'meduxInitStore'}: Partial<RenderOptions> = {}) {
  //             const router = createRouter('Browser', locationTransform);
  //             appExports.router = router;
  //             const ssrData = env[ssrKey];
  //             const storeOptions: ReduxOptions = {
  //               enhancers,
  //               initState: {...initState, ...ssrData, route: router.getRouteState()},
  //             };
  //             const store = createRedux(storeOptions);
  //             const renderView = (AppView: ComponentType<any>) => {
  //               const reRender = (View: ComponentType<any>) => {
  //                 const panel = env.document.getElementById(id);
  //                 unmountComponentAtNode(panel!);
  //                 const renderFun = env[ssrKey] ? hydrate : render;
  //                 renderFun(<View store={store} />, panel);
  //               };
  //               reRender(AppView);
  //               return reRender;
  //             };
  //             const run = renderApp(
  //               renderView,
  //               store,
  //               Object.keys(storeOptions.initState),
  //               moduleGetter,
  //               controllerMiddleware,
  //               appModuleName,
  //               appViewName
  //             );
  //             appExports.store = store;
  //             router.setStore(store);
  //             Object.defineProperty(appExports, 'state', {
  //               get: () => {
  //                 return store.getState();
  //               },
  //             });
  //             return {store, run};
  //           },
  //           ssr({id = 'root', ssrKey = 'meduxInitStore', request, response}: SSROptions) {
  //             if (!SSRTPL) {
  //               SSRTPL = env.decodeBas64('process.env.MEDUX_ENV_SSRTPL');
  //             }

  //             const storeOptions: ReduxOptions = {
  //               enhancers,
  //               initState: {...initState, route: routeState},
  //             };
  //             const store = createRedux(storeOptions);
  //             const ssrView = (AppView: ComponentType<any>) => {
  //               const data = store.getState();
  //               let html = require('react-dom/server').renderToString(<AppView store={store} />);

  //               const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
  //               if (match) {
  //                 const pageHead = html.split(/<head>|<\/head>/, 3);
  //                 html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
  //                 return SSRTPL.replace(
  //                   '</head>',
  //                   `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify(data)};</script>\r\n</head>`
  //                 ).replace(match[0], match[0] + html);
  //               }
  //               return html;
  //             };
  //             const run = ssrApp(ssrView, store, Object.keys(routeState.params), moduleGetter, controllerMiddleware, appModuleName, appViewName);
  //             appExports.store = store;
  //             router.setStore(store);
  //             Object.defineProperty(appExports, 'state', {
  //               get: () => {
  //                 return store.getState();
  //               },
  //             });
  //             return {store, run};
  //           },
  //         };
  //       },
  //     };
  //   },
  // };
}

// export function buildApp(
//   moduleGetter: ModuleGetter,
//   {
//     appModuleName = 'app',
//     appViewName = 'main',
//     historyType = 'Browser',
//     locationTransform,
//     storeOptions = {},
//     container = 'root',
//   }: {
//     appModuleName?: string;
//     appViewName?: string;
//     historyType?: 'Browser' | 'Hash' | 'Memory';
//     locationTransform: LocationTransform<any>;
//     storeOptions?: StoreOptions;
//     container?: string | Element;
//   }
// ) {
//   const router = createRouter(historyType, locationTransform);
//   appExports.router = router;
//   const {middlewares = [], reducers = {}, initData = {}} = storeOptions;
//   middlewares.unshift(routeMiddleware);
//   reducers.route = routeReducer;
//   const ssrData = env[SSRKey];
//   initData.route = router.getRouteState();

//   return renderApp<ComponentType<any>>(
//     (store, AppView) => {
//       const reRender = (View: ComponentType<any>) => {
//         const panel: any = typeof container === 'string' ? env.document.getElementById(container) : container;
//         unmountComponentAtNode(panel!);
//         const renderFun = ssrData ? hydrate : render;
//         renderFun(<View store={store} />, panel);
//       };
//       reRender(AppView);
//       return reRender;
//     },
//     moduleGetter,
//     appModuleName,
//     appViewName,
//     {...storeOptions, middlewares, reducers, initData: mergeState(initData, ssrData)},
//     (store) => {
//       router.setStore(store);
//       appExports.store = store as any;
//       Object.defineProperty(appExports, 'state', {
//         get: () => {
//           return store.getState();
//         },
//       });
//     },
//     ssrData ? Object.keys(initData.route.params) : []
//   );
// }

// export function buildSSR(
//   moduleGetter: ModuleGetter,
//   {
//     request,
//     response,
//     appModuleName = 'app',
//     appViewName = 'main',
//     locationTransform,
//     storeOptions = {},
//     container = 'root',
//   }: {
//     appModuleName?: string;
//     appViewName?: string;
//     request: ServerRequest;
//     response: ServerResponse;
//     locationTransform: LocationTransform<any>;
//     storeOptions?: StoreOptions;
//     container?: string;
//   }
// ): Promise<string> {
//   if (!SSRTPL) {
//     SSRTPL = env.decodeBas64('process.env.MEDUX_ENV_SSRTPL');
//   }
//   appExports.request = request;
//   appExports.response = response;
//   const router = createRouter(request.url, locationTransform);
//   appExports.router = router;
//   const {initData = {}} = storeOptions;
//   initData.route = router.getRouteState();

//   return renderSSR<ComponentType<any>>(
//     (store, AppView) => {
//       const data = store.getState();
//       return {
//         store,
//         data,
//         html: require('react-dom/server').renderToString(<AppView store={store} />),
//       };
//     },
//     moduleGetter,
//     appModuleName,
//     appViewName,
//     {...storeOptions, initData},
//     (store) => {
//       router.setStore(store);
//       appExports.store = store as any;
//       Object.defineProperty(appExports, 'state', {
//         get: () => {
//           return store.getState();
//         },
//       });
//     },
//     Object.keys(initData.route.params)
//   ).then(({html, data}) => {
//     const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${container}['"][^<>]*>`, 'm'));
//     if (match) {
//       const pageHead = html.split(/<head>|<\/head>/, 3);
//       html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
//       return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${SSRKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(
//         match[0],
//         match[0] + html
//       );
//     }
//     return html;
//   });
// }
