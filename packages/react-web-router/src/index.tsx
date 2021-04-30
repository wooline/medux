/* eslint-disable import/order */
import './env';
import React from 'react';
import {unmountComponentAtNode, hydrate, render} from 'react-dom';
import {routeMiddleware, setRouteConfig, routeConfig} from '@medux/route-web';
import {env, getRootModuleAPI, renderApp, ssrApp, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {createRouter} from '@medux/route-browser';
import {loadView, setLoadViewOptions} from './loadView';
import {MetaData} from './sington';
import type {ComponentType} from 'react';
import type {
  ModuleGetter,
  ExportModule,
  ControllerMiddleware,
  StoreBuilder,
  BStoreOptions,
  BStore,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
} from '@medux/core';
import type {RouteModule} from '@medux/route-web';
import type {IRouter} from '@medux/route-browser';
import type {LoadView} from './loadView';

export type {RootModuleFacade as Facade, Dispatch, CoreModuleState} from '@medux/core';

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
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@medux/route-web';

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

export function createApp(
  moduleGetter: ModuleGetter,
  middlewares: ControllerMiddleware[] = [],
  appModuleName: string = 'app',
  appViewName: string = 'main'
) {
  const controllerMiddleware = [routeMiddleware, ...middlewares];
  const {locationTransform} = moduleGetter['route']() as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return {
        render({id = 'root', ssrKey = 'meduxInitStore'}: RenderOptions = {}) {
          const router = createRouter('Browser', locationTransform);
          const routeState = router.getRouteState();
          const ssrData = env[ssrKey];
          const renderFun = ssrData ? hydrate : render;
          const panel = env.document.getElementById(id);
          const initState = {...storeOptions.initState, route: routeState, ...ssrData};
          const baseStore = storeCreator({...storeOptions, initState});
          const {store, beforeRender} = renderApp(baseStore, Object.keys(initState), moduleGetter, controllerMiddleware, appModuleName, appViewName);
          router.setStore(store);
          MetaData.router = router;
          return {
            store,
            run() {
              return beforeRender().then(({appView, setReRender}) => {
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
          const initState = {...storeOptions.initState, route: routeState};
          const baseStore = storeCreator({...storeOptions, initState});
          const {store, beforeRender} = ssrApp(
            baseStore,
            Object.keys(routeState.params),
            moduleGetter,
            controllerMiddleware,
            appModuleName,
            appViewName
          );
          router.setStore(store);
          MetaData.router = router;
          return {
            store,
            run() {
              return beforeRender().then(({appView: AppView}) => {
                const data = store.getState();
                let html: string = require('react-dom/server').renderToString(<AppView store={store} />);

                const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
                if (match) {
                  const pageHead = html.split(/<head>|<\/head>/, 3);
                  html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                  return SSRTPL.replace(
                    '</head>',
                    `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify(data)};</script>\r\n</head>`
                  ).replace(match[0], match[0] + html);
                }
                return html;
              });
            },
          };
        },
      };
    },
  };
}

export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

export type GetAPP<A extends RootModuleFacade> = {
  State: {[M in keyof A]?: A[M]['state']};
  GetRouter: () => IRouter<A['route']['state']['params'], A['route']['viewName']>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadView: LoadView<A>;
  Modules: RootModuleAPI<A>;
  Actions: RootModuleActions<A>;
  Pagenames: {[K in A['route']['viewName']]: K};
};

export function getApp<T extends {GetActions: any; GetRouter: any; LoadView: any; Modules: any; Pagenames: any}>(): Pick<
  T,
  'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'
> {
  const modules = getRootModuleAPI();
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: () => MetaData.router,
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames,
  };
}
