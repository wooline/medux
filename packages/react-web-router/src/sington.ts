import type {RootModuleFacade, RootModuleAPI, RootModuleActions} from '@medux/core';
import type {Store} from 'redux';
import type {RootState, HistoryActions} from '@medux/web';
import {getRootModuleAPI} from '@medux/core';
import {loadView, LoadView} from './components/LoadView';

export interface ServerRequest {
  url: string;
}

export interface ServerResponse {
  redirect(status: number, path: string): void;
}

export type FacadeExports<
  APP extends RootModuleFacade,
  RouteParams extends {[K in keyof APP]: any},
  Request extends ServerRequest = ServerRequest,
  Response extends ServerResponse = ServerResponse
> = {
  App: {
    store: Store;
    state: RootState<APP, RouteParams>;
    loadView: LoadView<APP>;
    history: HistoryActions<RouteParams>;
    getActions<N extends keyof APP>(...args: N[]): {[K in N]: APP[K]['actions']};
    request: Request;
    response: Response;
  };
  Modules: RootModuleAPI<APP>;
  Actions: RootModuleActions<APP>;
};

export const appExports: {store: any; state: any; loadView: any; getActions: any; history: HistoryActions; request: ServerRequest; response: ServerResponse} = {
  loadView,
  getActions: undefined,
  state: undefined,
  store: undefined,
  history: undefined as any,
  request: undefined as any,
  response: undefined as any,
};

export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

export function exportApp(): FacadeExports<any, any, any, any> {
  const modules = getRootModuleAPI();
  appExports.getActions = (...args: string[]) => {
    return args.reduce((prev, moduleName) => {
      prev[moduleName] = modules[moduleName].actions;
      return prev;
    }, {});
  };
  return {
    App: appExports as any,
    Modules: modules,
    Actions: {},
  };
}
