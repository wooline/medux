import { ModuleGetter, State, Dispatch, GetState } from './basic';
import { ControllerMiddleware } from './store';
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export interface BaseStore<S extends State = {}> {
    dispatch: Dispatch;
    getState: GetState<S>;
    update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
}
export interface BaseStoreOptions {
    middlewares: ControllerMiddleware[];
    initState: any;
}
export interface BuildAppOptions<SO extends BaseStoreOptions = BaseStoreOptions, RO = {}, SSO = {}> {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    appViewName: string;
    storeOptions: SO;
    renderOptions: RO;
    ssrOptions: SSO;
}
export declare function buildApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = {}, SSO = {}, V = any>(storeCreator: (storeOptions: SO) => ST, render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void, ssr: (store: ST, appView: V, ssrOptions: SSO) => string, preLoadModules: string[], { moduleGetter, appModuleName, appViewName, storeOptions, renderOptions, ssrOptions, }: BuildAppOptions<SO, RO, SSO>): {
    store: ST;
    render(): Promise<void>;
    ssr(): Promise<string>;
};
